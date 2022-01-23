import { Injectable, Injector } from "@sailplane/injector";

@Injectable()
export class CompanyRepository {
    fetchAllCompanies(): Promise<any[]> {
        return Promise.resolve([{ name: 'Company name' }]);
    }
}
