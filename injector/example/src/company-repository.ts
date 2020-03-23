import {Injector} from "@sailplane/injector";

export class CompanyRepository {
    fetchAllCompanies(): Promise<any[]> {
        return Promise.resolve([{ name: 'Company name' }]);
    }
}

Injector.register(CompanyRepository);
