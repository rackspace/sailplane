import {CompanyRepository} from "./company-repository";
import {Injector} from "@sailplane/injector";

export class CompanyService {

    constructor(private readonly companyRepo: CompanyRepository) {
    }

    listCompanies(): Promise<any[]> {
        return this.companyRepo.fetchAllCompanies();
    }
}

Injector.register(CompanyService, [CompanyRepository]);
