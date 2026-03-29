"use client";

import { useCreateExamMutation, useGetExamsQuery } from "@/gql/graphql";
import { useState } from "react";

export default function TestPage() {
  const [name, setName] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const { data, refetch, loading } = useGetExamsQuery();
  const [createExamMutation, {}] = useCreateExamMutation();

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
      <div className="flex flex-col gap-2 max-w-md">
        <input
          type="text"
          value={name}
          placeholder="name"
          onChange={(e) => {
            setName(e.target.value);
          }}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          value={creatorId}
          placeholder="creatorId (user id)"
          onChange={(e) => setCreatorId(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          value={subjectId}
          placeholder="subjectId"
          onChange={(e) => setSubjectId(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          value={topicId}
          placeholder="topicId"
          onChange={(e) => setTopicId(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          type="button"
          onClick={() => {
            void createExamMutation({
              variables: { name, creatorId, subjectId, topicId },
            });
            void refetch();
          }}
        >
          CREATE LESSON
        </button>
      </div>
    </div>
  );
}
