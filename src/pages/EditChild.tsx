import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { 
  useGetChild, 
  useUpdateChild,
  useDeleteChild,
  useGetTasks,
  useCreateTask,
  useDeleteTask,
  ChildGender,
  CreateTaskRequestRoutineType,
  GetTasksRoutineType
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clsx } from "clsx";

import { AvatarDisplay, AvatarPicker } from "@/components/AvatarDisplay";

export default function EditChild() {
  const { id } = useParams();
  const childId = parseInt(id!);
  const { user, getAuthHeaders, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<ChildGender>(ChildGender.boy);
  const [avatar, setAvatar] = useState("");

  const { data: child, isLoading: childLoading } = useGetChild(childId, { request: getAuthHeaders() });
  const { data: morningTasks = [] } = useGetTasks(childId, { routineType: GetTasksRoutineType.morning }, { request: getAuthHeaders() });
  const { data: eveningTasks = [] } = useGetTasks(childId, { routineType: GetTasksRoutineType.evening }, { request: getAuthHeaders() });

  const updateChildMut = useUpdateChild({ request: getAuthHeaders() });
  const deleteChildMut = useDeleteChild({ request: getAuthHeaders() });
  const createTaskMut = useCreateTask({ request: getAuthHeaders() });
  const deleteTaskMut = useDeleteTask({ request: getAuthHeaders() });

  useEffect(() => {
    if (child) {
      setName(child.name);
      setAge(child.age.toString());
      setGender(child.gender);
      setAvatar(child.avatar);
    }
  }, [child]);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [authLoading, user, setLocation]);

  if (authLoading || childLoading || !user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateChildMut.mutate({
      childId,
      data: { name, age: parseInt(age), gender, avatar }
    }, {
      onSuccess: () => {
        toast({ title: t('saveSuccess') });
        queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}`] });
      }
    });
  };

  const handleDeleteChild = () => {
    if (confirm("Are you sure you want to delete this child profile completely?")) {
      deleteChildMut.mutate({ childId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/children"] });
          setLocation("/");
        }
      });
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white sticky top-0 z-40 border-b border-slate-200 px-6 py-4 flex items-center">
        <Button variant="ghost" onClick={() => setLocation(`/child/${childId}`)} className="rounded-full me-4">
          <ArrowLeft className="w-5 h-5 me-2" />
          {t('back')}
        </Button>
        <h1 className="text-xl font-bold text-slate-800 flex-1">Editing: {child?.name}</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        {/* PROFILE CARD */}
        <Card className="rounded-3xl border-0 shadow-md overflow-hidden">
          <div className="bg-sky-500 h-24"></div>
          <CardContent className="pt-0 relative px-8 pb-8">
            <div className="absolute -top-14 left-8 border-4 border-white shadow-lg rounded-full">
              <AvatarDisplay avatar={avatar || 'Aiden'} name={name} size={96} />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button variant="ghost" onClick={handleDeleteChild} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-5 h-5 me-2" /> Delete Profile
              </Button>
            </div>

            <form onSubmit={handleUpdateProfile} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold">{t('childName')}</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required className="rounded-xl bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold">{t('age')}</Label>
                  <Input type="number" min="1" max="12" value={age} onChange={e => setAge(e.target.value)} required className="rounded-xl bg-slate-50" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-600 font-bold">{t('selectAvatar')}</Label>
                <AvatarPicker
                  value={avatar || ''}
                  onChange={v => setAvatar(v)}
                  defaultTab="all"
                />
              </div>

              <Button type="submit" disabled={updateChildMut.isPending} className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold px-8">
                <Save className="w-5 h-5 me-2" /> {t('save')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* TASKS MANAGEMENT */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200">
          <Tabs defaultValue="morning" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl h-14 bg-slate-100 p-1 mb-6">
              <TabsTrigger value="morning" className="rounded-xl text-lg font-bold data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm">☀️ {t('morning')}</TabsTrigger>
              <TabsTrigger value="evening" className="rounded-xl text-lg font-bold data-[state=active]:bg-indigo-900 data-[state=active]:text-indigo-200">🌙 {t('evening')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="morning" className="p-4 pt-0 outline-none">
              <TaskList 
                childId={childId} 
                routineType={CreateTaskRequestRoutineType.morning} 
                tasks={morningTasks} 
                createTaskMut={createTaskMut} 
                deleteTaskMut={deleteTaskMut} 
                t={t} 
              />
            </TabsContent>
            
            <TabsContent value="evening" className="p-4 pt-0 outline-none">
              <TaskList 
                childId={childId} 
                routineType={CreateTaskRequestRoutineType.evening} 
                tasks={eveningTasks} 
                createTaskMut={createTaskMut} 
                deleteTaskMut={deleteTaskMut} 
                t={t} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function TaskList({ childId, routineType, tasks, createTaskMut, deleteTaskMut, t }: any) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [emoji, setEmoji] = useState("✨");
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [titleFr, setTitleFr] = useState("");

  const handleDelete = (taskId: number) => {
    deleteTaskMut.mutate({ childId, taskId }, {
      onSuccess: () => {
        toast({ title: t('deleteSuccess') });
        queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/tasks`] });
      }
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMut.mutate({
      childId,
      data: {
        title, titleAr: titleAr || title, titleFr: titleFr || title,
        emoji, routineType, points: 10, order: tasks.length + 1
      }
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setTitle(""); setTitleAr(""); setTitleFr(""); setEmoji("✨");
        queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/tasks`] });
      }
    });
  };

  return (
    <div className="space-y-4">
      {tasks.map((task: any) => (
        <div key={task.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-4">
            <span className="text-3xl bg-white p-2 rounded-xl shadow-sm">{task.emoji}</span>
            <div>
              <p className="font-bold text-lg text-slate-800">{task.title}</p>
              <p className="text-sm text-slate-500">{task.titleAr} • {task.titleFr}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      ))}

      {isAdding ? (
        <Card className="border-2 border-sky-200 bg-sky-50 shadow-none">
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-20">
                  <Label className="text-xs font-bold text-slate-500">{t('emoji')}</Label>
                  <Input value={emoji} onChange={e => setEmoji(e.target.value)} required className="text-center text-2xl h-12" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs font-bold text-slate-500">{t('taskEn')}</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Brush teeth" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs font-bold text-slate-500">{t('taskAr')}</Label>
                  <Input value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="اختياري" dir="rtl" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs font-bold text-slate-500">{t('taskFr')}</Label>
                  <Input value={titleFr} onChange={e => setTitleFr(e.target.value)} placeholder="Optionnel" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
                <Button type="submit" disabled={createTaskMut.isPending} className="bg-sky-600 hover:bg-sky-700">{t('save')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsAdding(true)} 
          variant="outline" 
          className="w-full py-6 border-dashed border-2 rounded-2xl border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        >
          <Plus className="w-5 h-5 me-2" /> {t('addTask')}
        </Button>
      )}
    </div>
  );
}
