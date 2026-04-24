import * as yup from "yup"

const registerSchema = yup.object({
    email: yup.string().required("This field is required!").min(3,"Email cannot be shorter than 3 characters!"),
    password: yup.string().required("This field is required!").min(6,"Password cannot be shorter than 6 characters!").max(16,"Password cannot be longer than 16 characters!"),
    username: yup.string().required("This field is required!").min(5,"Username cannot be shorter than 5 characters!").max(16,"Username cannot be longer than 16 characters!"),
    control: yup.boolean().isTrue("You must accept the Terms of Service!")
})

export default registerSchema