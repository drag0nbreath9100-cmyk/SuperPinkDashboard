export type PlanType = "4D_BALANCED" | "3D_LOWER_GLUTE" | "4D_STRONG_LOWER" | "3D_GENERAL" | "2D_FB";

export interface ExerciseRow {
    exerciseId: string;
    sets: string;
    reps: string;
    weight: string;
    rest: string;
    // Read-only info fields
    mainMuscle?: string;
    subMuscle?: string;
}
