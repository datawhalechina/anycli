"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Lang } from "@/i18n/messages";

const installMethods: { value: string; labelKey: string }[] = [
  { value: "brew", labelKey: "publish.installMethod.brew" },
  { value: "npm", labelKey: "publish.installMethod.npm" },
  { value: "pnpm", labelKey: "publish.installMethod.pnpm" },
  { value: "cargo", labelKey: "publish.installMethod.cargo" },
  { value: "pip", labelKey: "publish.installMethod.pip" },
  { value: "go", labelKey: "publish.installMethod.go" },
  { value: "other", labelKey: "publish.installMethod.other" },
];

const LICENSE_OPTIONS: { value: string; labelKey?: string; label?: string }[] = [
  { value: "", labelKey: "publish.license.empty" },
  { value: "MIT", label: "MIT" },
  { value: "Apache-2.0", label: "Apache-2.0" },
  { value: "BSD-3-Clause", label: "BSD-3-Clause" },
  { value: "BSD-2-Clause", label: "BSD-2-Clause" },
  { value: "ISC", label: "ISC" },
  { value: "GPL-3.0-only", label: "GPL-3.0-only" },
  { value: "GPL-2.0-only", label: "GPL-2.0-only" },
  { value: "AGPL-3.0", label: "AGPL-3.0" },
  { value: "LGPL-3.0", label: "LGPL-3.0" },
  { value: "LGPL-2.1", label: "LGPL-2.1" },
  { value: "MPL-2.0", label: "MPL-2.0" },
  { value: "Unlicense", label: "Unlicense" },
  { value: "CC0-1.0", labelKey: "publish.license.cc0" },
  { value: "Proprietary", labelKey: "publish.license.proprietary" },
  { value: "__other__", labelKey: "publish.license.other" },
];

const LICENSE_SELECT_VALUES = new Set(
  LICENSE_OPTIONS.filter((o) => o.value && o.value !== "__other__").map((o) => o.value),
);

function splitLicenseInitial(lic: string): { select: string; custom: string } {
  const t = lic.trim();
  if (!t) return { select: "", custom: "" };
  if (LICENSE_SELECT_VALUES.has(t)) return { select: t, custom: "" };
  return { select: "__other__", custom: lic };
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{children}</p>;
}

function Req() {
  return (
    <abbr className="ml-0.5 text-red-500 no-underline dark:text-red-400" title="required">
      *
    </abbr>
  );
}

function StringListEditor({
  label,
  hint,
  items,
  onChange,
  max,
  placeholder,
  itemHint,
  lang,
}: {
  label: React.ReactNode;
  hint?: string;
  items: string[];
  onChange: (next: string[]) => void;
  max: number;
  placeholder?: string;
  itemHint?: string;
  lang: Lang;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const t = draft.trim();
    if (!t || items.length >= max) return;
    if (items.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...items, t]);
    setDraft("");
  }

  function remove(i: number) {
    onChange(items.filter((_, j) => j !== i));
  }

  return (
    <div className="sm:col-span-2">
      <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      {items.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--elevated)] py-1 pl-2.5 pr-1 text-sm text-[var(--foreground)]"
            >
              <span className="max-w-[220px] truncate" title={item}>
                {item}
              </span>
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--surface)] hover:text-red-600 dark:hover:text-red-400"
                onClick={() => remove(i)}
                aria-label={t(lang, "publish.list.remove").replace("{item}", item)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          disabled={items.length >= max}
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={add}
          disabled={items.length >= max || !draft.trim()}
          className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--elevated)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t(lang, "publish.list.add")}
        </button>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {itemHint} · {t(lang, "publish.list.added").replace("{count}", String(items.length)).replace("{max}", String(max))}
      </p>
    </div>
  );
}

export type PublishFormInitial = {
  name: string;
  description: string;
  version: string;
  homepage: string;
  repository: string;
  license: string;
  tags: string[];
  categories: string[];
  docsUrl: string;
  installMethod: string;
  installPackage: string;
  binaryName: string;
  runExample: string;
};

const emptyInitial: PublishFormInitial = {
  name: "",
  description: "",
  version: "",
  homepage: "",
  repository: "",
  license: "",
  tags: [],
  categories: [],
  docsUrl: "",
  installMethod: "",
  installPackage: "",
  binaryName: "",
  runExample: "",
};

type Props = {
  mode?: "create" | "edit";
  slug?: string;
  initial?: Partial<PublishFormInitial>;
  lang: Lang;
};

export function PublishForm({ mode = "create", slug: editSlug, initial, lang }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit" && Boolean(editSlug);
  const merged: PublishFormInitial = {
    ...emptyInitial,
    ...initial,
    tags: initial?.tags ?? emptyInitial.tags,
    categories: initial?.categories ?? emptyInitial.categories,
    docsUrl: initial?.docsUrl ?? emptyInitial.docsUrl,
  };

  const licInit = splitLicenseInitial(merged.license);

  const [slug, setSlug] = useState(editSlug ?? "");
  const [name, setName] = useState(merged.name);
  const [description, setDescription] = useState(merged.description);
  const [version, setVersion] = useState(merged.version);
  const [homepage, setHomepage] = useState(merged.homepage);
  const [repository, setRepository] = useState(merged.repository);
  const [licenseSelect, setLicenseSelect] = useState(licInit.select);
  const [licenseCustom, setLicenseCustom] = useState(licInit.custom);
  const [tagItems, setTagItems] = useState<string[]>(merged.tags);
  const [categoryItems, setCategoryItems] = useState<string[]>(merged.categories);
  const [docsUrl, setDocsUrl] = useState(merged.docsUrl);
  const [installMethod, setInstallMethod] = useState(merged.installMethod);
  const [installPackage, setInstallPackage] = useState(merged.installPackage);
  const [binaryName, setBinaryName] = useState(merged.binaryName);
  const [runExample, setRunExample] = useState(merged.runExample);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function friendlyError(data: { error?: unknown; details?: unknown }) {
    if (typeof data.error === "string" && data.error.trim()) return data.error.trim();
    const details = data.details as
      | { fieldErrors?: Record<string, unknown>; formErrors?: unknown }
      | undefined;
    const fieldErrors = details?.fieldErrors as Record<string, unknown> | undefined;
    if (fieldErrors && typeof fieldErrors === "object") {
      for (const key of Object.keys(fieldErrors)) {
        const v = fieldErrors[key];
        if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim()) return v[0].trim();
      }
    }
    const formErrors = details?.formErrors;
    if (Array.isArray(formErrors) && typeof formErrors[0] === "string" && formErrors[0].trim()) {
      return formErrors[0].trim();
    }
    return t(lang, "publish.error.generic");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (tagItems.length < 1) {
      setError(t(lang, "publish.error.tagsMin"));
      return;
    }
    if (categoryItems.length < 1) {
      setError(t(lang, "publish.error.categoriesMin"));
      return;
    }
    if (!installMethod) {
      setError(t(lang, "publish.error.installMethod"));
      return;
    }

    const licenseResolved =
      licenseSelect === "__other__"
        ? licenseCustom.trim() || undefined
        : licenseSelect.trim() || undefined;

    const body = {
      name: name.trim(),
      description: description.trim(),
      version: version.trim() || undefined,
      homepage: homepage.trim(),
      repository: repository.trim(),
      license: licenseResolved,
      tags: tagItems,
      categories: categoryItems,
      docsUrl: docsUrl.trim(),
      installMethod,
      installPackage: installPackage.trim(),
      binaryName: binaryName.trim(),
      runExample: runExample.trim(),
    };

    setPending(true);
    const res = isEdit
      ? await fetch(`/api/clis/${encodeURIComponent(editSlug!)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/clis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            slug: slug.trim(),
          }),
        });
    const data = (await res.json().catch(() => ({}))) as { slug?: string; error?: string; details?: unknown };
    setPending(false);
    if (!res.ok) {
      setError(friendlyError(data));
      return;
    }
    if (data.slug) router.push(`/clis/${data.slug}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-[var(--foreground)] sm:col-span-2">
          {t(lang, "publish.field.slug")}
          {!isEdit ? <Req /> : null}
          <FieldHint>
            {t(lang, "publish.field.slug.hint")}
            {isEdit ? t(lang, "publish.field.slug.locked") : null}
          </FieldHint>
          <input
            required={!isEdit}
            readOnly={isEdit}
            disabled={isEdit}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            placeholder={t(lang, "publish.field.slug.placeholder")}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-70"
          />
        </label>

        <label className="text-sm font-medium text-[var(--foreground)] sm:col-span-2">
          {t(lang, "publish.field.name")}
          <Req />
          <FieldHint>{t(lang, "publish.field.name.hint")}</FieldHint>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(lang, "publish.field.name.placeholder")}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>

        <label className="text-sm font-medium text-[var(--foreground)] sm:col-span-2">
          {t(lang, "publish.field.description")}
          <Req />
          <FieldHint>{t(lang, "publish.field.description.hint")}</FieldHint>
          <textarea
            required
            minLength={10}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>

        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(lang, "publish.field.version")}
          <FieldHint>{t(lang, "publish.field.version.hint")}</FieldHint>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>

        <div>
          <label className="text-sm font-medium text-[var(--foreground)]">{t(lang, "publish.field.license")}</label>
          <FieldHint>{t(lang, "publish.field.license.hint")}</FieldHint>
          <select
            value={licenseSelect}
            onChange={(e) => setLicenseSelect(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          >
            {LICENSE_OPTIONS.map((m) => (
              <option key={m.value || "empty"} value={m.value}>
                {m.label ?? (m.labelKey ? t(lang, m.labelKey) : "")}
              </option>
            ))}
          </select>
          {licenseSelect === "__other__" ? (
            <input
              value={licenseCustom}
              onChange={(e) => setLicenseCustom(e.target.value)}
              placeholder={t(lang, "publish.field.license.customPlaceholder")}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
            />
          ) : null}
        </div>

        <label className="text-sm font-medium text-[var(--foreground)] sm:col-span-2">
          {t(lang, "publish.field.homepage")}
          <Req />
          <FieldHint>{t(lang, "publish.field.urlRequiredHint")}</FieldHint>
          <input
            type="url"
            required
            value={homepage}
            onChange={(e) => setHomepage(e.target.value)}
            placeholder="https://"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>

        <label className="text-sm font-medium text-[var(--foreground)] sm:col-span-2">
          {t(lang, "publish.field.repository")}
          <Req />
          <FieldHint>{t(lang, "publish.field.repository.hint")}</FieldHint>
          <input
            type="url"
            required
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            placeholder={t(lang, "publish.field.repository.placeholder")}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>

        <label className="text-sm font-medium text-[var(--foreground)] sm:col-span-2">
          {t(lang, "publish.field.docsUrl")}
          <Req />
          <FieldHint>{t(lang, "publish.field.docsUrl.hint")}</FieldHint>
          <input
            type="url"
            required
            value={docsUrl}
            onChange={(e) => setDocsUrl(e.target.value)}
            placeholder="https://"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>

        <StringListEditor
          label={
            <>
              {t(lang, "publish.field.tags")}
              <Req />
            </>
          }
          hint={t(lang, "publish.field.tags.hint")}
          items={tagItems}
          onChange={setTagItems}
          max={40}
          placeholder={t(lang, "publish.field.tags.placeholder")}
          itemHint={t(lang, "publish.field.tags.itemHint")}
          lang={lang}
        />

        <StringListEditor
          label={
            <>
              {t(lang, "publish.field.categories")}
              <Req />
            </>
          }
          hint={t(lang, "publish.field.categories.hint")}
          items={categoryItems}
          onChange={setCategoryItems}
          max={20}
          placeholder={t(lang, "publish.field.categories.placeholder")}
          itemHint={t(lang, "publish.field.categories.itemHint")}
          lang={lang}
        />

        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(lang, "publish.field.installMethod")}
          <Req />
          <FieldHint>{t(lang, "publish.field.installMethod.hint")}</FieldHint>
          <select
            required
            value={installMethod}
            onChange={(e) => setInstallMethod(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          >
            <option value="" disabled>
              {t(lang, "publish.select")}
            </option>
            {installMethods.map((m) => (
              <option key={m.value || "empty"} value={m.value}>
                {t(lang, m.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(lang, "publish.field.installPackage")}
          <Req />
          <FieldHint>{t(lang, "publish.field.installPackage.hint")}</FieldHint>
          <input
            required
            value={installPackage}
            onChange={(e) => setInstallPackage(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>

        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(lang, "publish.field.binaryName")}
          <Req />
          <FieldHint>{t(lang, "publish.field.binaryName.hint")}</FieldHint>
          <input
            required
            value={binaryName}
            onChange={(e) => setBinaryName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>

        <label className="text-sm font-medium text-[var(--foreground)] sm:col-span-2">
          {t(lang, "publish.field.runExample")}
          <Req />
          <FieldHint>{t(lang, "publish.field.runExample.hint")}</FieldHint>
          <input
            required
            value={runExample}
            onChange={(e) => setRunExample(e.target.value)}
            placeholder={t(lang, "publish.field.runExample.placeholder")}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>

      </div>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t(lang, "publish.submit.pending") : isEdit ? t(lang, "publish.submit.save") : t(lang, "publish.submit.publish")}
      </button>
    </form>
  );
}
