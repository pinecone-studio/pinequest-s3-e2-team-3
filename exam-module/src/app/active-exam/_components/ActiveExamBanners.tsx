type ActiveExamBannersProps = {
  timeUpAwaitingSubmit: boolean;
  submitted: boolean;
  submitError: string | null;
};

export function ActiveExamBanners({
  timeUpAwaitingSubmit,
  submitted,
  submitError,
}: ActiveExamBannersProps) {
  return (
    <>
      {timeUpAwaitingSubmit ? (
        <div className="w-full max-w-7xl mb-4 rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          Шалгалтын цаг дууссан. Таны хариу автоматаар хадгалагдаж байна…
        </div>
      ) : null}
      {submitted ? (
        <div className="w-full max-w-7xl mb-4 rounded-2xl border border-green-500/40 bg-green-950/30 px-4 py-3 text-sm text-green-200">
          Хариу амжилттай илгээгдлээ.
        </div>
      ) : null}
      {submitError ? (
        <div className="w-full max-w-7xl mb-4 rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {submitError}
        </div>
      ) : null}
    </>
  );
}
