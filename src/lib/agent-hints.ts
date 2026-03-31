import { installCommand } from "@/lib/cli-json";

type Input = {
  name: string;
  slug?: string;
  description: string;
  installMethod: string | null;
  installPackage: string | null;
  binaryName: string | null;
  runExample: string | null;
  docsUrls: string[];
};

export function buildAgentHints(input: Input) {
  const command = installCommand({
    installMethod: input.installMethod,
    installPackage: input.installPackage,
    binaryName: input.binaryName,
  });

  const example_usage = [
    command ? command : null,
    input.binaryName ? `${input.binaryName} --help` : null,
    input.runExample ? input.runExample : null,
  ].filter((x): x is string => typeof x === "string" && x.trim().length > 0);

  const when_to_use = [
    `当你需要使用「${input.name}」相关能力时使用。`,
    input.description.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const docs_urls = input.docsUrls.filter(Boolean).slice(0, 12);

  return {
    when_to_use,
    example_usage,
    docs_urls,
  };
}

