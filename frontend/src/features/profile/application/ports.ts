import type { DownloadedFile } from "../../../lib/api/client";
import type { CopyFormat } from "../domain/copy";

/** What the profile feature needs from the outside; tests give a double. */
export interface ProfileGateway {
  logout(): Promise<void>;
  exportCopy(format: CopyFormat): Promise<DownloadedFile>;
  /** The account and everything of it, in one transaction. */
  deleteAccount(): Promise<void>;
}
