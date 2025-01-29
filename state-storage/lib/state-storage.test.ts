import { StateStorage } from "./state-storage";
import { SSMClient } from "@aws-sdk/client-ssm";

describe("StateStorage", () => {
  const mockSSMClient = {
    send: jest.fn(),
  };
  let sut: StateStorage;

  describe("#set", () => {
    beforeEach(() => {
      mockSSMClient.send.mockReset();
      sut = new StateStorage("/prefix/", mockSSMClient as unknown as SSMClient);
    });

    test("store something noisily", async () => {
      // GIVEN
      mockSSMClient.send.mockResolvedValue({});

      // WHEN
      await sut.set("service", "name", { value: "hello" });

      // THEN
      expect(mockSSMClient.send).toHaveBeenCalledTimes(1);
      expect(mockSSMClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: "/prefix/service/name",
            Value: '{"value":"hello"}',
            Type: "String",
            Overwrite: true,
          },
        }),
      );
    });

    test("store something quietly", async () => {
      // GIVEN
      mockSSMClient.send.mockResolvedValue({});

      // WHEN
      await sut.set("service", "name", { value: "hello" }, true);

      // THEN
      expect(mockSSMClient.send).toHaveBeenCalledTimes(1);
      expect(mockSSMClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: "/prefix/service/name",
            Value: '{"value":"hello"}',
            Type: "String",
            Overwrite: true,
          },
        }),
      );
    });

    test("store something as raw string", async () => {
      // GIVEN
      mockSSMClient.send.mockResolvedValue({});

      // WHEN
      await sut.set("service", "name", "Goodbye", { quiet: true, isRaw: true });

      // THEN
      expect(mockSSMClient.send).toHaveBeenCalledTimes(1);
      expect(mockSSMClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: "/prefix/service/name",
            Value: "Goodbye",
            Type: "String",
            Overwrite: true,
          },
        }),
      );
    });

    // Repeat with quiet flag in order to achieve code coverage
    test("store something securely", async () => {
      // GIVEN
      mockSSMClient.send.mockResolvedValue({});

      // WHEN
      await sut.set("service", "name", { value: "hello" }, { secure: true });

      // THEN
      expect(mockSSMClient.send).toHaveBeenCalledTimes(1);
      expect(mockSSMClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: "/prefix/service/name",
            Value: '{"value":"hello"}',
            Type: "SecureString",
            Overwrite: true,
          },
        }),
      );
    });
  });

  describe("#get", () => {
    beforeEach(() => {
      mockSSMClient.send.mockReset();
      sut = new StateStorage("/prefix", mockSSMClient as any as SSMClient);
    });

    test("fetch something noisily", async () => {
      // GIVEN
      mockSSMClient.send.mockResolvedValue({
        Parameter: {
          Value: '{"value":"hello"}',
        },
      });

      // WHEN
      const result = await sut.get("service", "name");

      // THEN
      expect(mockSSMClient.send).toHaveBeenCalledTimes(1);
      expect(mockSSMClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: "/prefix/service/name",
          },
        }),
      );
      expect(result.value).toEqual("hello");
    });

    test("fetch missing something quietly", async () => {
      // GIVEN
      mockSSMClient.send.mockResolvedValue({});

      // WHEN
      const result = await sut.get("service", "name", true);

      // THEN
      expect(mockSSMClient.send).toHaveBeenCalledTimes(1);
      expect(mockSSMClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { Name: "/prefix/service/name" },
        }),
      );
      expect(result).toBeUndefined();
    });

    test("fetch something as raw string", async () => {
      // GIVEN
      mockSSMClient.send.mockResolvedValue({
        Parameter: {
          Value: '{"value":"hello"}',
        },
      });

      // WHEN
      const result = await sut.get("service", "name", { isRaw: true });

      // THEN
      expect(mockSSMClient.send).toHaveBeenCalledTimes(1);
      expect(mockSSMClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { Name: "/prefix/service/name" },
        }),
      );
      expect(result).toEqual('{"value":"hello"}');
    });

    test("fetch something securely", async () => {
      // GIVEN
      mockSSMClient.send.mockResolvedValue({
        Parameter: {
          Value: '{"value":"hello"}',
        },
      });

      // WHEN
      const result = await sut.get("service", "name", { secure: true });

      // THEN
      expect(mockSSMClient.send).toHaveBeenCalledTimes(1);
      expect(mockSSMClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: "/prefix/service/name",
            WithDecryption: true,
          },
        }),
      );
      expect(result.value).toEqual("hello");
    });
  });
});
