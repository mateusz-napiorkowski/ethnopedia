import React from "react"
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react'
import LoginPage from "../LoginPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const queryClient = new QueryClient();

test('example test', async () => {
    render(<QueryClientProvider client={queryClient}><Router initialEntries={['/']}><LoginPage /></Router></QueryClientProvider>)
    const usernameInputElement = screen.getByPlaceholderText("Nazwa użytkownika")
    const passwordInputElement = screen.getByPlaceholderText("••••••••")
    await userEvent.type(usernameInputElement, "username")
    await userEvent.type(passwordInputElement, "123")
    const loginButton = screen.getByTestId("login-button")
    userEvent.click(loginButton)
    
    // expect().toMatchSnapshot()
});