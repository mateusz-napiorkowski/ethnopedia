import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Toast, ToastToggle } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { JWT, useUser } from "../providers/UserProvider";
import { jwtDecode } from "jwt-decode";
import { useMutation } from "react-query"
import { loginUser } from "../api/auth";

const LoginPage = () => {
    const { setUserData } = useUser();
    const [showErrorToast, setShowErrorToast] = useState(false);
    const navigate = useNavigate();

    const validationSchema = Yup.object().shape({
        username: Yup.string().required("Nazwa użytkownika jest wymagana"),
        password: Yup.string().required("Hasło jest wymagane"),
    });

    const loginUserMutation = useMutation(
        (data: { username: string; password: string }) => loginUser(data),
        {
            onSuccess: (response) => {
                const token = response.token;
                localStorage.setItem("token", token);
                const decodedToken = jwtDecode<JWT>(token);
                setUserData(true, decodedToken.firstName, token, decodedToken.userId, decodedToken.username);
                navigate("/");
            },
            onError: (error: any) => {
                setShowErrorToast(true);
            },
        }
    );

    useEffect(() => {
        let timer: any;
        if (showErrorToast) {
            timer = setTimeout(() => setShowErrorToast(false), 3000);
        }
        return () => clearTimeout(timer);
    }, [showErrorToast]);

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            {showErrorToast && (
                <div className={`fixed bottom-5 right-5 z-50 ${showErrorToast ? "animate-slide-in" : "animate-fade-out"}`}>
                    <Toast>
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-700 dark:text-red-200">
                            <HiExclamation />
                        </div>
                        <div className="mx-3 text-sm font-normal">Nieprawidłowa nazwa użytkownika lub hasło.</div>
                        <ToastToggle onClick={() => setShowErrorToast(false)} />
                    </Toast>
                </div>
            )}

            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 dark:border-gray-600">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-600 border border-gray-200">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Zaloguj się
                        </h1>
                        <Formik
                            initialValues={{ username: "", password: "" }}
                            validationSchema={validationSchema}
                            onSubmit={(values, { setSubmitting }) => {
                                const { username, password } = values;

                                loginUserMutation.mutate({ username, password }, {
                                onSettled: () => {
                                    setSubmitting(false);
                                },
                            });
                            }}
                        >
                            {({ errors, touched }) => (
                                <Form className="space-y-4 md:space-y-6">
                                    <div>
                                        <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Nazwa użytkownika
                                        </label>
                                        <Field
                                            name="username"
                                            id="username"
                                            className={`bg-gray-50 border ${errors.username && touched.username ? "border-red-500 bg-red-50" : "border-gray-300"} text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                                            placeholder="Nazwa użytkownika"
                                        />
                                        <ErrorMessage name="username" component="div" className="text-red-600 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Hasło
                                        </label>
                                        <Field
                                            type="password"
                                            name="password"
                                            id="password"
                                            className={`bg-gray-50 border ${errors.password && touched.password ? "border-red-500 bg-red-50" : "border-gray-300"} text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                                            placeholder="••••••••"
                                        />
                                        <ErrorMessage name="password" component="div" className="text-red-600 text-sm" />
                                    </div>
                                    <button type="submit" data-testid="login-button" className="color-button w-full">
                                        Zaloguj się
                                    </button>
                                </Form>
                            )}
                        </Formik>
                        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            Nie masz konta?{" "}
                            <span
                                className="ml-1 font-medium text-primary-600 hover:underline dark:text-primary-500 cursor-pointer"
                                onClick={() => navigate("/register")}
                            >
                                Zarejestruj się.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;
