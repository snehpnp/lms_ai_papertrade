import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminCourseContentService, adminAiService } from "@/services/admin.service";

const generateId = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
};

interface Module {
  id: string;
  title: string;
}

interface Course {
  id: string;
  title: string;
  modules: Module[];
}

interface Lesson {
  id: string;
  title: string;
  module_id: string;
  course_id: string;
  course_name: string;
}

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

const QuizForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [lessonId, setLessonId] = useState("");

  const [questionData, setQuestionData] = useState({
    type: "MCQ" as "MCQ" | "FILL_IN_BLANKS",
    question: "",
    answer: "", // only for FILL_IN_BLANKS
    options: [
      { id: generateId(), text: "", isCorrect: true },
    ] as Option[],
  });

  useEffect(() => {
    loadCourses();
    loadAllLessons();
    if (isEdit && id) loadExercise(id);
  }, [id]);

  const loadCourses = async () => {
    try {
      const res = await adminCourseContentService.coursewithmodule();
      setCourses(res || []);
    } catch {
      toast.error("Failed to load courses");
    }
  };

  const loadAllLessons = async () => {
    try {
      const res = await adminCourseContentService.getLessonOptions();
      setLessons(res || []);
    } catch {
      toast.error("Failed to load lessons map");
    }
  };

  const loadExercise = async (exId: string) => {
    try {
      const data = await adminCourseContentService.getOneExercise(exId);

      if (data.lesson_id) {
        setLessonId(data.lesson_id);
        const lsn = lessons.find(l => l.id === data.lesson_id);
        if (lsn) {
          setCourseId(lsn.course_id);
          setModuleId(lsn.module_id);
        }
      }

      setQuestionData({
        type: data.type || "MCQ",
        question: data.question || "",
        answer: data.answer || "",
        options: data.options?.length > 0
          ? data.options
          : [{ id: generateId(), text: "", isCorrect: true }]
      });

    } catch {
      toast.error("Failed to load quiz");
    }
  };

  const handleAIGenerate = async () => {
    if (!questionData.question.trim()) {
      return toast.error("Please enter a question topic or prompt first");
    }

    try {
      setGeneratingAI(true);
      toast.info("AI is generating your question...", { id: "ai-gen" });

      const { questions } = await adminAiService.generateQuizQuestions(
        questionData.question,
        "", // standalone quiz, no lesson content context here usually
        1
      );

      if (questions && questions.length > 0) {
        const q = questions[0];
        setQuestionData(prev => ({
          ...prev,
          question: q.question,
          type: "MCQ", // AI generates MCQs currently
          options: q.options.map((opt: any) => ({
            id: generateId(),
            text: opt.text,
            isCorrect: opt.isCorrect,
          }))
        }));
        toast.success("Question generated successfully!", { id: "ai-gen" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate question", { id: "ai-gen" });
    } finally {
      setGeneratingAI(false);
    }
  };

  // Sync derived state from lesson choice if user manually picks
  useEffect(() => {
    if (lessonId && lessons.length > 0) {
      const selected = lessons.find(l => l.id === lessonId);
      if (selected) {
        setCourseId(selected.course_id);
        setModuleId(selected.module_id);
      }
    }
  }, [lessonId, lessons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonId && !courseId) return toast.error("Select at least a course or lesson");
    if (!questionData.question.trim()) return toast.error("Question text is required");

    if (questionData.type === "FILL_IN_BLANKS" && !questionData.answer.trim()) {
      return toast.error("Answer is required for Text questions");
    }

    if (questionData.type === "MCQ") {
      if (questionData.options.length < 2) return toast.error("MCQ requires at least 2 options");
      if (!questionData.options.some((o) => o.isCorrect)) return toast.error("MCQ requires a correct option");
      for (const o of questionData.options) {
        if (!o.text.trim()) return toast.error("All options must not be empty");
      }
    }

    const payload = {
      type: questionData.type,
      question: questionData.question,
      options: questionData.type === "MCQ" ? questionData.options : undefined,
      answer: questionData.type === "FILL_IN_BLANKS" ? questionData.answer : undefined,
    };

    try {
      setLoading(true);

      if (isEdit && id) {
        await adminCourseContentService.updateExercise(id, payload);
        toast.success("Quiz updated");
      } else {
        if (lessonId) {
          await adminCourseContentService.addExercise(lessonId, payload);
          toast.success("Quiz added to lesson");
        } else {
          // Not hooked up strictly in UI right now for loose course, assuming lesson attach
          toast.error("Please assign a lesson");
          setLoading(false);
          return;
        }
      }

      navigate(-1);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    setQuestionData(prev => ({
      ...prev,
      options: [...prev.options, { id: generateId(), text: "", isCorrect: false }]
    }));
  };

  const handleOptionChange = (index: number, val: string) => {
    const opts = [...questionData.options];
    opts[index].text = val;
    setQuestionData(prev => ({ ...prev, options: opts }));
  };

  const handleCorrectOption = (index: number) => {
    const opts = questionData.options.map((o, i) => ({ ...o, isCorrect: i === index }));
    setQuestionData(prev => ({ ...prev, options: opts }));
  };

  const handleRemoveOption = (index: number) => {
    const opts = [...questionData.options];
    opts.splice(index, 1);
    setQuestionData(prev => ({ ...prev, options: opts }));
  };

  return (
    <div className="animate-fade-in pb-12">
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
        className="inline-flex items-center gap-1.5 text-sm mb-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <PageHeader
        title={isEdit ? "Edit Quiz Question" : "Create Quiz Question"}
        subtitle="Standalone Quiz/Exercise Manager"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <div className="grid grid-cols-12 gap-5">

          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <label className="block text-sm font-medium mb-1.5">Assign to Lesson</label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
              disabled={isEdit}
            >
              <option value="">Select Lesson</option>
              {lessons.map((lsn) => (
                <option key={lsn.id} value={lsn.id}>
                  {lsn.course_name} — {lsn.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 mt-4 pt-4 border-t border-border">
            <div className="flex gap-4 items-center mb-5">
              <label className="text-sm font-medium">Question Type:</label>
              <select
                className="text-sm border rounded-lg px-3 py-1.5 bg-background"
                value={questionData.type}
                onChange={(e) => setQuestionData(prev => ({ ...prev, type: e.target.value as "MCQ" | "FILL_IN_BLANKS" }))}
              >
                <option value="MCQ">Multiple Choice Question</option>
                <option value="FILL_IN_BLANKS">Short Text Answer</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium block">Question Prompt (Topic)</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAIGenerate}
                  disabled={generatingAI || !questionData.question.trim()}
                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10 gap-1.5 border border-primary/20"
                >
                  {generatingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {generatingAI ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Input
                value={questionData.question}
                onChange={e => setQuestionData({ ...questionData, question: e.target.value })}
                placeholder="What is..."
                className="bg-background"
                required
              />
            </div>

            {questionData.type === "FILL_IN_BLANKS" && (
              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 block">Exact Answer Needed to Pass</label>
                <Input
                  value={questionData.answer}
                  onChange={e => setQuestionData({ ...questionData, answer: e.target.value })}
                  placeholder="Type answer here"
                  className="bg-background"
                />
              </div>
            )}

            {questionData.type === "MCQ" && (
              <div className="space-y-3">
                <label className="text-sm font-medium block">Options & Select Correct Answer</label>
                {questionData.options.map((opt, optIndex) => (
                  <div key={opt.id} className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer shrank-0 bg-background border px-3 py-2 rounded-lg hover:bg-muted">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectOption(optIndex)}
                        className="w-4 h-4 text-primary cursor-pointer accent-primary"
                      />
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Correct</span>
                    </label>
                    <Input className="flex-1 min-w-[200px] bg-background" value={opt.text} onChange={e => handleOptionChange(optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} required />
                    {questionData.options.length > 2 && (
                      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500" onClick={() => handleRemoveOption(optIndex)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddOption} className="px-4 text-xs">
                    + Add Option
                  </Button>
                </div>
              </div>
            )}

          </div>

          <div className="col-span-12 flex gap-3 pt-6 border-t border-border mt-4">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Please wait..." : isEdit ? "Update Quiz Question" : "Publish Quiz Question"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>
              Cancel Setup
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default QuizForm;
