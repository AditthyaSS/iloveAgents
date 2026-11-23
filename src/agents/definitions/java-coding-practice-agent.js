const javaCodingPracticeAgent={
    id: "java-coding-practice",
    name: "Java Coding Pratice Agent",
    description: "Generates Java coding questions provides hints, and evaluates solutions.",
    category:"Programming",
    icon: "Code",
    provider: "openai",
    model: "gpt-4o",
    inputs: [
    {
        name:"difficulty",
        type:"select",
        label:"Difficulty Level",
        options:["Beginner","Intermediate","Advanced"],
        required: true,
    },
    {
        name:"Topic",
        type:"text",
        label:"Java topic",
        required: true,
    },
],
}
export default javaCodingPracticeAgent;