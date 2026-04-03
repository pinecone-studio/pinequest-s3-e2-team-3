import { formatCountdown } from "./active-exam-utils";
import { ActiveExamFullPage } from "./ActiveExamFullPage";

type ExamSessionLike = {
  startTime: string;
  endTime: string;
};

export function InvalidLinkScreen() {
  return (
    <ActiveExamFullPage>
      <p className="text-lg font-medium text-slate-800">Шалгалтын холбоос буруу байна.</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        И-мэйлээр ирсэн холбоосоор орно уу (studentId болон examId эсвэл
        examSessionId заавал байх ёстой).
      </p>
    </ActiveExamFullPage>
  );
}

export function SessionScheduleLoadingScreen() {
  return (
    <ActiveExamFullPage showSpinner footerText="Шалгалтын хуваарь ачаалж байна…" />
  );
}

export function SessionNotFoundScreen() {
  return (
    <ActiveExamFullPage>
      <p className="text-lg font-medium text-slate-800">Шалгалтын сесс олдсонгүй.</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Холбоос хүчингүй эсвэл хугацаа дууссан байж магадгүй. Багшид хандана
        уу.
      </p>
    </ActiveExamFullPage>
  );
}

export function SessionExamIdMismatchScreen() {
  return (
    <ActiveExamFullPage>
      <p className="text-lg font-medium text-slate-800">Холбоосын өгөгдөл таарахгүй байна.</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        examId болон examSessionId зөрчилтэй байна.
      </p>
    </ActiveExamFullPage>
  );
}

export function SessionNotStartedScreen({
  session,
  now,
}: {
  session: ExamSessionLike;
  now: number;
}) {
  const startMs = Date.parse(session.startTime);
  const untilStart = startMs - now;
  return (
    <ActiveExamFullPage>
      <p className="text-lg font-medium text-slate-800">Шалгалт одоогоор эхлээгүй байна.</p>
      <p className="mt-4 text-3xl font-mono tabular-nums text-indigo-600">
        {formatCountdown(untilStart)}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Эхлэх цаг: {new Date(session.startTime).toLocaleString()}
      </p>
      <p className="mt-4 max-w-md text-xs text-slate-400">
        Шалгалтын асуултууд эхлэх цагт л харагдана.
      </p>
    </ActiveExamFullPage>
  );
}

export function SessionEndedLateScreen({ session }: { session: ExamSessionLike }) {
  return (
    <ActiveExamFullPage>
      <p className="text-lg font-medium text-slate-800">Шалгалтын хугацаа дууссан.</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Та шалгалтын цонхонд оролцоогүй тул асуулт харуулахгүй.
      </p>
      <p className="mt-2 text-xs text-slate-400">
        Дууссан: {new Date(session.endTime).toLocaleString()}
      </p>
    </ActiveExamFullPage>
  );
}

export function SessionSubmittedThanksScreen({
  session,
}: {
  session: ExamSessionLike;
}) {
  return (
    <ActiveExamFullPage>
      <p className="text-lg font-medium text-green-600">
        Your answer has been submitted.
      </p>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Таны хариу амжилттай хадгалагдсан. Та энэ шалгалтын сессд дахин
        оролцох боломжгүй.
      </p>
      <p className="mt-4 text-xs text-slate-400">
        Дууссан: {new Date(session.endTime).toLocaleString()}
      </p>
    </ActiveExamFullPage>
  );
}

export function ExamMaterialLoadingScreen() {
  return (
    <ActiveExamFullPage
      showSpinner
      footerText="Шалгалтын материал ачаалж байна…"
    />
  );
}

export function ExamMaterialErrorScreen({ message }: { message: string }) {
  return (
    <ActiveExamFullPage>
      <p className="text-lg font-medium text-slate-800">Шалгалтын материал олдсонгүй.</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">{message}</p>
    </ActiveExamFullPage>
  );
}

export function VariationPickingScreen() {
  return (
    <ActiveExamFullPage showSpinner footerText="Хувилбар сонгож байна…" />
  );
}
