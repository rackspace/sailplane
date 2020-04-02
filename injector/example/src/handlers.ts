import {CompanyService} from "./company-service";
import {Injector} from "@sailplane/injector";
import {wrapApiHandler} from "@sailplane/lambda-utils";

/**
 * Return a list of all company records.
 */
export const getCompanies = wrapApiHandler(async () => {
    const list = await Injector.get(CompanyService)!.listCompanies();

    return {companies: list};
});
