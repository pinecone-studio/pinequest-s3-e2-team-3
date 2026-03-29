export const runtime = "edge";
import { Suspense } from "react";
import { ActiveExamPageContent } from "./_components/ActiveExamPageContent";
import { SessionScheduleLoadingScreen } from "./_components/ActiveExamGateScreens";

export default function ActiveExamPage() {
  return (
    <Suspense fallback={<SessionScheduleLoadingScreen />}>
      <ActiveExamPageContent />
    </Suspense>
  );
}
