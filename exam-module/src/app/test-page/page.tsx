"use client";

import { useCreateExamMutation, useGetExamsQuery } from "@/gql/graphql";
import { useState } from "react";

export default function TestPage() {
  const [name, setName] = useState("");
  const { data, refetch, loading } = useGetExamsQuery();
  const [createExamMutation, {}] = useCreateExamMutation({
    //   refetchQueries: [{ query: GetExamsDocument }],
    variables: {
      name: name, // value for 'name'
    },
  });

  if (loading) return <div className="p-10">Уншиж байна...</div>;

  return (
    <div className="flex flex-col gap-3 p-6">
      <h1 className="text-xl font-bold mb-4">Шалгалтын жагсаалт</h1>

      {data?.exams.map((exam) => (
        <div
          key={exam.id}
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 transition-colors"
        >
          <span className="font-medium text-gray-800">{exam.name}</span>
        </div>
      ))}
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <button
          onClick={() => {
            createExamMutation();
            refetch();
          }}
        >
          CREATE LESSON
        </button>
      </div>
    </div>
  );
}
