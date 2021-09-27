import { SSMClient } from "@aws-sdk/client-ssm";
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
export declare class StateStorage {
    private readonly namePrefix;
    private readonly ssm;
    /**
     * Construct
     *
     * @param namePrefix prefix string to start all parameter names with.
     *                   Should at least include the environment (dev/prod).
     * @param ssm the SSMClient to use
     */
    constructor(namePrefix: string, ssm?: SSMClient);
    /**
     * Save state for a later run.
     *
     * @param {string} service name of the service (class name?) that owns the state
     * @param {string} name name of the state variable to save
     * @param value content to save
     * @param optionsOrQuiet a StateStorageOptions, or if true sets quiet option. (For backward compatibility.)
     * @returns {Promise<void>} completes upon success - rejects if lacking ssm:PutParameter permission
     */
    set(service: string, name: string, value: any, optionsOrQuiet?: boolean | StateStorageOptions): Promise<void>;
    /**
     * Fetch last state saved.
     *
     * @param {string} service name of the service (class name?) that owns the state
     * @param {string} name name of the state variable to fetch
     * @param optionsOrQuiet a StateStorageOptions, or if true sets quiet option. (For backward compatibility.)
     * @returns {Promise<any>} completes with the saved value, or reject if not found or lacking ssm:GetParameter permission
     */
    get(service: string, name: string, optionsOrQuiet?: boolean | StateStorageOptions): Promise<any>;
    protected generateName(service: string, name: string): string;
}
export {};
