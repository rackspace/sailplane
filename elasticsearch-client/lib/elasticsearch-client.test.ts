import { ElasticsearchClient, ElasticsearchResult } from "./elasticsearch-client";
import { AwsHttps } from "@sailplane/aws-https";

describe("ElasticsearchClient", () => {
  test("request() with data success", async () => {
    // GIVEN
    const resultObj: ElasticsearchResult = {
      _shards: { total: 1, successful: 1, failed: 0 },
      _index: "thing",
      found: true,
    };
    const mockHttp = createMockHttp(Promise.resolve(resultObj));
    const sut = new ElasticsearchClient(mockHttp, "hostdomain");

    // WHEN
    const result = await sut.request("POST", "/thing", { s: "Hello" });

    // THEN
    expect(result).toEqual(resultObj);
    expect(mockHttp.calls.length).toBe(1);
    expect(mockHttp.calls[0]).toEqual({
      method: "POST",
      hostname: "hostdomain",
      path: "/thing",
      headers: {
        accept: "application/json; charset=utf-8",
        "content-type": "application/json; charset=utf-8",
      },
      timeout: 10000,
      body: '{"s":"Hello"}',
      awsSign: true,
    });
  });

  test("request() without data success", async () => {
    // GIVEN
    const resultObj: ElasticsearchResult = {
      _shards: { total: 1, successful: 1, failed: 0 },
      _index: "thing",
      found: true,
    };
    const mockHttp = createMockHttp(Promise.resolve(resultObj));
    const sut = new ElasticsearchClient(mockHttp, "hostdomain");

    // WHEN
    const result = await sut.request("GET", "/thing");

    // THEN
    expect(result).toEqual(resultObj);
    expect(mockHttp.calls.length).toBe(1);
    expect(mockHttp.calls[0]).toEqual({
      method: "GET",
      hostname: "hostdomain",
      path: "/thing",
      headers: {
        accept: "application/json; charset=utf-8",
        "content-type": "application/json; charset=utf-8",
      },
      timeout: 10000,
      body: undefined,
      awsSign: true,
    });
  });

  test("request() not found", async () => {
    // GIVEN
    const resultObj: ElasticsearchResult = {
      _shards: { total: 0, successful: 0, failed: 1 },
      found: false,
    };
    const mockHttp = createMockHttp(Promise.reject({ statusCode: 404 }));
    const sut = new ElasticsearchClient(mockHttp, "hostdomain");

    // WHEN
    const result = await sut.request("GET", "/thing");

    // THEN
    expect(result).toEqual(resultObj);
    expect(mockHttp.calls.length).toBe(1);
  });

  test("request() server failure", async () => {
    // GIVEN
    const mockHttp = createMockHttp(Promise.reject({ statusCode: 500 }));
    const sut = new ElasticsearchClient(mockHttp, "hostdomain");

    // WHEN
    const result = sut.request("GET", "/thing");

    // THEN
    await expect(result).rejects.toEqual({ statusCode: 500 });
    expect(mockHttp.calls.length).toBe(1);
  });
});

function createMockHttp(result: Promise<ElasticsearchResult>): AwsHttps & { calls: Array<any> } {
  const calls: Array<any> = [];
  return {
    calls: calls,
    request: (options: any) => {
      calls.push(options);
      return result;
    },
  } as any;
}
