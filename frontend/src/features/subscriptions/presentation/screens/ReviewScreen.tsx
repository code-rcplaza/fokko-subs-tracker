import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { SideNav } from "../../../../components/layout/SideNav";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useReview } from "../../application/useReview";
import type { ReviewCardActions } from "../components/ReviewCard";
import { ReviewList } from "../components/ReviewList";
import { ReviewZone } from "../components/ReviewProgress";

export interface ReviewScreenProps {
  readonly account: { readonly name: string; readonly email: string };
}

/** Revisión: the user decides on each possible subscription, and can undo it. */
export function ReviewScreen({ account }: ReviewScreenProps) {
  const navigateTo = useNavigateTo();
  const review = useReview();
  const actions: ReviewCardActions = {
    onYes: review.answerYes,
    onChooseCadence: review.chooseCadence,
    onCancel: review.cancelChoosing,
    onConfirm: review.confirm,
    onDismiss: review.dismiss,
    onUndo: review.undo,
  };
  const isReady = !review.isLoading && review.error === undefined;

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={
        isReady ? <ReviewZone progress={review.progress} /> : <SegmentedRing variant="loading" size={104} />
      }
      nav={<BottomNav onNavigate={navigateTo} />}
      sideNav={<SideNav account={account} onNavigate={navigateTo} />}
    >
      {review.error !== undefined && (
        <p role="alert" className="mx-6 mt-8 rounded-md bg-error-surface p-4 text-sm text-danger-ink md:mx-0">
          {review.error}
        </p>
      )}
      {isReady && (
        <ReviewList
          cards={review.cards}
          progress={review.progress}
          actions={actions}
          onNavigate={navigateTo}
        />
      )}
    </AppShell>
  );
}
