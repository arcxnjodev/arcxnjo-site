import * as yup from "yup"

const loginSchema = yup.object({
    email: yup.string().required("This field is required!").min(3,"Email cannot be shorter than 3 characters!"),
    password: yup.string().required("This field is required!").min(6,"Password cannot be shorter than 6 characters!").max(16,"Password cannot be longer than 16 characters!"),
})

export default loginSchema