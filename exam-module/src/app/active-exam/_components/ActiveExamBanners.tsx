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
        <div className="w-full max-w-7xl mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Шалгалтын цаг дууссан. Таны хариу автоматаар хадгалагдаж байна…
        </div>
      ) : null}
      {submitted ? (
        <div className="w-full max-w-7xl mb-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
          Хариу амжилттай илгээгдлээ.
        </div>
      ) : null}
      {submitError ? (
        <div className="w-full max-w-7xl mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}
    </>
  );
}
