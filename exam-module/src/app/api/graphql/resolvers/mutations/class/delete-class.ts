import { MutationResolvers } from "@/gql/graphql";

export const deleteClass: MutationResolvers["deleteClass"] = async (
  _,
  { id },
  context,
) => {
  const res = await context.db
    .prepare("DELETE FROM classes WHERE id = ?;")
    .bind(id)
    .run();
  const changes =
    (res as { meta?: { changes?: number } })?.meta?.changes ??
    (res as { changes?: number })?.changes ??
    0;
  return changes > 0;
};

