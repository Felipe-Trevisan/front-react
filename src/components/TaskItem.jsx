import { startTransition, useOptimistic, useState, useTransition } from "react";

export default function TaskItem({ task, onToggle, onEdit, onRemove }) {
  const [concluida, setOptimisticConcluida] = useOptimistic(task.concluida);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startSaving] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticConcluida((prev) => !prev);
      await onToggle(task);
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") setIsEditing(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const titulo = formData.get("titulo").trim();
    const descricao = formData.get("descricao").trim() || null;
    const unchanged = titulo === task.titulo && descricao === task.descricao;

    if (!titulo || unchanged) {
      setIsEditing(false);
      return;
    }

    startSaving(async () => {
      const ok = await onEdit(task, { titulo, descricao });
      if (ok) setIsEditing(false);
    });
  };

  let className = "task";
  if (concluida) className += " task--done";

  return (
    <li className={className}>
      <div className="task__check">
        <input
          className="checkbox"
          type="checkbox"
          checked={concluida}
          onChange={handleToggle}
          aria-label={`Concluir: ${task.titulo}`}
        />
      </div>
      {isEditing ? (
        <form className="task__edit" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <input name="titulo" type="text" defaultValue={task.titulo} />
          <input name="descricao" type="text" defaultValue={task.descricao ?? ""} />
          <button type="submit" disabled={isPending}>Salvar</button>
        </form>
      ) : (
        <>
          <div className="task__body">
            <span className="task__title">{task.titulo}</span>
            {task.descricao && <p className="task__description">{task.descricao}</p>}
          </div>
          <div className="task__actions">
            <button className="task__action" aria-label={`Editar: ${task.titulo}`} onClick={() => setIsEditing(true)}>
              Editar
            </button>
            <button className="task__action task-action--danger" aria-label={`Remover: ${task.titulo}`} onClick={() => onRemove(task)}>
              Remover
            </button>
          </div>
        </>
      )}
    </li>
  );
}
