// Set AWS credentials early to override any set in the calling environment.
process.env.AWS_SECRET_ACCESS_KEY="abc123";
process.env.AWS_ACCESS_KEY_ID="deadbeaf";
delete process.env.AWS_SESSION_TOKEN;

import {AwsHttps} from "./aws-https";
import * as nock from "nock";

describe('AwsHttps with AWS', () => {
    const serverHostname = 'example.com';
    const serverUrl = 'https://' + serverHostname;

    afterAll(() => {
        nock.cleanAll();
    });

    test('request(POST /test body sigv4)', async () => {
        // // GIVEN
        const body = JSON.stringify({ cursor: 3, map: "Irvine"});
        const response = { success: true };
        const scope = nock(serverUrl, {
                reqheaders: {
                    "X-Amz-Date": /20......T......Z/,
                    "Authorization": /AWS4-HMAC-SHA256 Credential=deadbeaf.*, SignedHeaders=content-length;content-type;host;x-amz-date, Signature=.*/
                }
            })
            .post('/test', body)
            .reply(200, response);
        const sut = new AwsHttps(true);

        // WHEN
        const reply = await sut.request({
            protocol: 'https:',
            method: 'POST',
            hostname: serverHostname,
            path: '/test',
            body: body,
            awsSign: true,
            headers: { 'Content-Type': 'application/json' }
        });

        // THEN
        expect(reply).toEqual(response);
        expect(scope.isDone()).toBeTruthy();
    });

});
