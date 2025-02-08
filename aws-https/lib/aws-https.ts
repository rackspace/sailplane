/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as AWS from "aws-sdk";
import { Credentials, CredentialsOptions } from "aws-sdk/lib/credentials";
import * as aws4 from "aws4";
import * as http from "http";
import * as https from "https";
import { Logger } from "@sailplane/logger";
import { URL } from "url";

const logger = new Logger("aws-https");

/**
 * Same options as https://nodejs.org/api/http.html#http_http_request_options_callback
 * with the addition of optional body to send with POST, PUT, or PATCH
 * and option to AWS Sig4 sign the request.
 */
export type AwsHttpsOptions = aws4.Request & {
  /** Body content of HTTP POST, PUT or PATCH */
  body?: string;

  /** If true, apply AWS Signature v4 to the request */
  awsSign?: boolean;
};

/**
 * Light-weight utility for making HTTPS requests in AWS environments.
 */
export class AwsHttps {
  /** Resolves when credentials are available - shared by all instances */
  private static credentialsInitializedPromise: Promise<void> | undefined = undefined;

  /** Credentials to use in this instance */
  private awsCredentials?: Credentials | CredentialsOptions;

  /**
   * Constructor.
   * @param verbose true to log everything, false for silence,
   *                undefined (default) for normal logging.
   * @param credentials
   *      If not defined, credentials will be obtained by default SDK behavior for the runtime environment.
   *                      This happens once and then is cached; good for Lambdas.
   *      If `true`, clear cached to obtain fresh credentials from SDK.
   *                 Good for longer running containers that rotate credentials.
   *      If an object with accessKeyId, secretAccessKey, and sessionToken,
   *                 use these credentials for this instance.
   */
  constructor(
    private readonly verbose?: boolean,
    credentials?: boolean | Credentials | CredentialsOptions,
  ) {
    if (credentials) {
      AwsHttps.credentialsInitializedPromise = undefined;
      if (typeof credentials === "object" && credentials.accessKeyId) {
        this.awsCredentials = credentials;
      }
    }
  }

  /**
   * Perform an HTTPS request and return the JSON body of the result.
   *
   * @params options https request options, with optional body and awsSign
   * @returns parsed JSON content, or null if none.
   * @throws {Error{message,status,statusCode}} error if HTTP result is not 2xx or unable
   *              to parse response. Compatible with http-errors package.
   */
  async request(options: AwsHttpsOptions): Promise<any | null> {
    let requestOptions = options;

    if (options.awsSign === true) {
      requestOptions = await this.awsSign(requestOptions);
    }

    this.verbose === true && logger.debug("HTTPS Request: ", requestOptions);

    return new Promise<any | null>((resolve, reject) => {
      // eslint-disable-next-line prefer-const -- eslint is simply wrong about this
      let timeoutHandle: any | undefined;
      const request = https.request(requestOptions, (response: http.IncomingMessage) => {
        this.verbose !== false && logger.info("Status: " + response.statusCode);

        const body: Array<Buffer | string> = [];

        // Save each chunk of response data
        response.on("data", (chunk) => body.push(chunk));

        // End of response - process it
        response.on("end", () => {
          clearTimeout(timeoutHandle!);
          const content = body.join("");

          if (!response.statusCode || response.statusCode < 200 || response.statusCode > 299) {
            // HTTP status indicates failure. Throw http-errors compatible error.
            const err: any = new Error(
              "Failed to load content, status code: " + response.statusCode,
            );
            err.status = err.statusCode = response.statusCode || 0;
            this.verbose !== false && logger.warn(err.message + " ", content);
            reject(err);
          } else if (content) {
            this.verbose === true && logger.debug("HTTP response content: " + content);
            try {
              resolve(JSON.parse(content));
            } catch (someError) {
              if (
                someError &&
                typeof someError === "object" &&
                "message" in someError &&
                typeof someError.message === "string"
              ) {
                const err = someError as any;
                logger.warn(err.message, content);
                err.status = err.statusCode = 400;
                reject(err);
              } else {
                logger.warn("Unexpected error:", someError);
                reject(someError);
              }
            }
          } else {
            this.verbose === true && logger.debug("HTTP response " + response.statusCode);
            resolve(null);
          }
        });

        // Theoretically this should be called based on requestOptions#timeout.
        // It doesn't, but leaving this code here in case in ever gets fixed by Node.js.
        /* istanbul ignore next */
        response.on("timeout", () => {
          logger.warn(
            `Request timeout from ${options.protocol}://${options.hostname}:${options.port}`,
          );
          request.destroy();
        });
      });

      // Communication timeout - The HttpRequest setTimeout and requestOptions#timeout
      // aren't reliable across various Node.js versions, so timing out this way.
      timeoutHandle = setTimeout(() => {
        logger.warn(
          `Request timeout from ${options.protocol}://${options.hostname}:${options.port}`,
        );
        request.destroy();
      }, options.timeout || 120000);

      // Connection error
      request.on("error", (err) => {
        logger.warn(
          `Error response from ${options.protocol}://${options.hostname}:${options.port}: ${err.message}`,
        );
        reject(err);
      });

      if (options.body) request.write(options.body);

      request.end();
    });
  }

  /**
   * Helper to build a starter AwsHttpsOptions object from a URL.
   *
   * @param method an HTTP method/verb
   * @param url the URL to request from
   * @param connectTimeout (default 5000) milliseconds to wait for connection to establish
   * @returns an AwsHttpsOptions object, which may be further modified before use.
   */
  buildOptions(
    method: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH",
    url: URL,
    connectTimeout = 5000,
  ): AwsHttpsOptions {
    return {
      protocol: url.protocol,
      method: method,
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + (url.search || ""),
      timeout: connectTimeout,
    };
  }

  /**
   * Helper for signing AWS requests
   * @param request to make
   * @return signed version of the request.
   */
  private async awsSign(request: AwsHttpsOptions): Promise<AwsHttpsOptions> {
    if (!this.awsCredentials) {
      if (!AwsHttps.credentialsInitializedPromise) {
        // Prepare process-wide AWS credentials
        AwsHttps.credentialsInitializedPromise = new Promise((resolve, reject) => {
          AWS.config.getCredentials((err) => {
            if (err) {
              logger.error("Unable to load AWS credentials", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }

      // Wait for process-wide AWS credentials to be available
      await AwsHttps.credentialsInitializedPromise;
      this.awsCredentials = AWS.config.credentials!;
    }

    // Sign the request
    const signCreds = {
      accessKeyId: this.awsCredentials.accessKeyId,
      secretAccessKey: this.awsCredentials.secretAccessKey,
      sessionToken: this.awsCredentials.sessionToken,
    };
    const awsRequest = aws4.sign({ ...request, host: request.host ?? undefined }, signCreds);
    return {
      ...awsRequest,
      body: awsRequest.body?.toString(),
    };
  }
}
