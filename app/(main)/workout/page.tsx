import WorkoutLogForm from '@/components/forms/workout-log-form'

const WorkoutPage = () => {
    return (
        <div>
            <h1>Log a Workout</h1>
            <p>Keep track of your progress & stay consistent.</p>

            <div>
                <WorkoutLogForm />
            </div>
        </div>
    )
}

export default WorkoutPage