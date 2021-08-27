import {SSMClient, GetParameterCommand, PutParameterCommand} from "@aws-sdk/client-ssm";
import {Logger} from "@sailplane/logger";

const logger = new Logger('state-storage');

interface StateStorageOptions {
    /** If true, do not log values. */
    quiet?: boolean;
    /**
     * If true, store as encrypted or decrypt on get. Uses account default KMS key.
     * Implies quiet as well.
     */
    secure?: boolean;
    /**
     * If set, set and get the value as is, not JSON. (Only works for string values.)
     */
    isRaw?: boolean;
}

/**
 * Service for storing state of other services.
 * Saved state can be fetched by any other execution of code in the AWS account, region,
 * and environment (dev/prod).
 *
 * Suggested use with Injector:
 *   Injector.register(StateStorage, () => new StateStorage(process.env.STATE_STORAGE_PREFIX));
 */
export class StateStorage {
    /**
     * Construct
     *
     * @param namePrefix prefix string to start all parameter names with.
     *                   Should at least include the environment (dev/prod).
     * @param ssm the SSMClient to use
     */
    constructor(
        private readonly namePrefix: string,
        /* istanbul ignore next - default never used when unit testing */
        private readonly ssm = new SSMClient({})
    ) {
        if (!this.namePrefix.endsWith('/'))
            this.namePrefix = this.namePrefix + '/';
    }

    /**
     * Save state for a later run.
     *
     * @param {string} service name of the service (class name?) that owns the state
     * @param {string} name name of the state variable to save
     * @param value content to save
     * @param optionsOrQuiet a StateStorageOptions, or if true sets quiet option. (For backward compatibility.)
     * @returns {Promise<void>} completes upon success - rejects if lacking ssm:PutParameter permission
     */
    set(service: string, name: string, value: any, optionsOrQuiet: boolean | StateStorageOptions = {}): Promise<void> {
        const options = optionsOrQuiet === true ? {quiet: true} : optionsOrQuiet as StateStorageOptions;
        const key = this.generateName(service, name);
        const content = options.isRaw === true ? value : JSON.stringify(value);

        if (options.quiet || options.secure) {
            logger.info(`Saving state ${key}`);
        }
        else {
            logger.info(`Saving state ${key}=${content}`);
        }

        const command = new PutParameterCommand({
            Name: key,
            Type: options.secure ? 'SecureString' : 'String',
            Value: content,
            Overwrite: true
        });
        return this.ssm.send(command).then(() => undefined);
    }

    /**
     * Fetch last state saved.
     *
     * @param {string} service name of the service (class name?) that owns the state
     * @param {string} name name of the state variable to fetch
     * @param optionsOrQuiet a StateStorageOptions, or if true sets quiet option. (For backward compatibility.)
     * @returns {Promise<any>} completes with the saved value, or reject if not found or lacking ssm:GetParameter permission
     */
    get(service: string, name: string, optionsOrQuiet: boolean | StateStorageOptions = {}): Promise<any> {
        const options = optionsOrQuiet === true ? {quiet: true} : optionsOrQuiet as StateStorageOptions;
        const key = this.generateName(service, name);
        const command = new GetParameterCommand({
            Name: key,
            WithDecryption: options.secure
        });

        return this.ssm.send(command)
            .then(result => {
                const content = result && result.Parameter ? result.Parameter.Value : undefined;

                if (options.quiet || options.secure) {
                    logger.info(`Loaded state ${key}`);
                }
                else {
                    logger.info(`Loaded state ${key}=${content}`);
                }

                return options.isRaw ? content : (content ? JSON.parse(content) : undefined);
            });
    }

    protected generateName(service: string, name: string): string {
        return this.namePrefix + service + '/' + name;
    }
}
