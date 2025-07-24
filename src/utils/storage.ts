import { PageMetadata, StorageKeys } from "@/types";

const pageMetadataStorage = storage.defineItem<PageMetadata>(
  `local:${StorageKeys.PAGE_METADATA}`,
);
export { pageMetadataStorage };
