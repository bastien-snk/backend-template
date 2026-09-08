import type { SeedTask } from "@/systems/seeding/seed-task";

/** Resolves a deterministic topological execution plan for seed tasks. */
export class SeedPlanResolver {
    resolve(tasks: SeedTask[]): SeedTask[] {
        const taskById = this.buildTaskMap(tasks);
        this.ensureAllDependenciesExist(tasks, taskById);

        return this.buildTopologicalOrder(tasks, taskById);
    }

    private buildTaskMap(tasks: SeedTask[]): Map<string, SeedTask> {
        const taskById = new Map<string, SeedTask>();

        for (const task of tasks) {
            if (taskById.has(task.id)) {
                throw new Error(`duplicate seed task id: ${task.id}`);
            }

            taskById.set(task.id, task);
        }

        return taskById;
    }

    private ensureAllDependenciesExist(
        tasks: SeedTask[],
        taskById: Map<string, SeedTask>,
    ): void {
        for (const task of tasks) {
            for (const dependencyId of task.dependsOn) {
                if (!taskById.has(dependencyId)) {
                    throw new Error(
                        `missing seed dependency: ${task.id} -> ${dependencyId}`,
                    );
                }
            }
        }
    }

    private buildTopologicalOrder(
        tasks: SeedTask[],
        taskById: Map<string, SeedTask>,
    ): SeedTask[] {
        const orderedTasks: SeedTask[] = [];
        const visitedTaskIds = new Set<string>();
        const visitingTaskIds = new Set<string>();

        for (const task of tasks) {
            this.visitTask(
                task,
                taskById,
                orderedTasks,
                visitedTaskIds,
                visitingTaskIds,
            );
        }

        return orderedTasks;
    }

    private visitTask(
        task: SeedTask,
        taskById: Map<string, SeedTask>,
        orderedTasks: SeedTask[],
        visitedTaskIds: Set<string>,
        visitingTaskIds: Set<string>,
    ): void {
        if (visitedTaskIds.has(task.id)) {
            return;
        }

        if (visitingTaskIds.has(task.id)) {
            throw new Error(`cyclic seed dependency detected at: ${task.id}`);
        }

        visitingTaskIds.add(task.id);

        for (const dependencyId of task.dependsOn) {
            const dependencyTask = taskById.get(dependencyId);
            if (!dependencyTask) {
                throw new Error(
                    `missing seed dependency: ${task.id} -> ${dependencyId}`,
                );
            }

            this.visitTask(
                dependencyTask,
                taskById,
                orderedTasks,
                visitedTaskIds,
                visitingTaskIds,
            );
        }

        visitingTaskIds.delete(task.id);
        visitedTaskIds.add(task.id);
        orderedTasks.push(task);
    }
}
