import * as AWS from "aws-sdk";
import {Logger} from "@sailplane/logger";

const logger = new Logger('state-storage');

/**
 * Service for storing state of other services.
 * Saved state can be fetched by any other execution of code in the AWS account, region,
 * and environment (dev/prod).
 *
 * Suggested use with Injector:
 *   Injector.register(StateStorage, ()=>new StateStorage(process.env.STATE_STORAGE_PREFIX));
 */
export class StateStorage {

    private readonly ssm = new AWS.SSM({apiVersion: '2014-11-06'});

    /**
     * Construct
     *
     * @param namePrefix prefix string to start all parameter names with.
     *                   Should at least include the environment (dev/prod).
     */
    constructor(private readonly namePrefix: string) {
        if (!this.namePrefix.endsWith('/'))
            this.namePrefix = this.namePrefix + '/';
    }

    /**
     * Save state for a later run.
     *
     * @param {string} service name of the service (class name?) that owns the state
     * @param {string} name name of the state variable to save
     * @param value content to save
     * @param quiet if true, don't log content
     * @returns {Promise<void>} completes upon success - failures shouldn't happen
     */
    set(service: string, name: string, value: any, quiet = false): Promise<void> {
        const key = this.generateName(service, name);
        const content = JSON.stringify(value);

        if (quiet) {
            logger.info(`Saving state ${key}`);
        }
        else {
            logger.info(`Saving state ${key}=${content}`);
        }

        return this.ssm.putParameter({
            Name: key,
            Type: 'String',
            Value: content,
            Overwrite: true
        }).promise().then(() => undefined);
    }

    /**
     * Fetch last state saved.
     *
     * @param {string} service name of the service (class name?) that owns the state
     * @param {string} name name of the state variable to fetch
     * @param quiet if true, don't log content
     * @returns {Promise<any>} completes with the saved value, or reject if not found
     */
    get(service: string, name: string, quiet = false): Promise<any> {
        const key = this.generateName(service, name);

        return this.ssm.getParameter({ Name: key })
            .promise().then((result: AWS.SSM.GetParameterResult) => {
                const content = result && result.Parameter ? result.Parameter.Value : undefined;

                if (quiet) {
                    logger.info(`Loaded state ${key}`);
                }
                else {
                    logger.info(`Loaded state ${key}=${content}`);
                }
                return content ? JSON.parse(content) : undefined;
            });
    }

    protected generateName(service: string, name: string): string {
        return this.namePrefix + service + '/' + name;
    }
}
