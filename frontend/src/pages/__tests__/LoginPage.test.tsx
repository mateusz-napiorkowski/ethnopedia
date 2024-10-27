import React from "react"
import { fireEvent, render, screen } from '@testing-library/react'
import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import LoginPage from "../LoginPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const queryClient = new QueryClient();

test('example test', async () => {


    render(<QueryClientProvider client={queryClient}><Router initialEntries={['/']}><LoginPage /></Router></QueryClientProvider>)
    const usernameInputElement = screen.getByPlaceholderText("Nazwa użytkownika")
    await userEvent.type(usernameInputElement, "username")
    // fireEvent.change(usernameInputElement, {target: {value: "username"}})
    const passwordInputElement = screen.getByPlaceholderText("••••••••")
    await userEvent.type(usernameInputElement, "123")
    // fireEvent.change(passwordInputElement, {target: {value: "123"}})
    // const loginButton = screen.getByTestId("loginButton")
    // await userEvent.click(loginButton)

    // const testowy = screen.getByTestId("testowy")
    // await userEvent.click(testowy)
    // expect(testowy).toMatchSnapshot()
    expect(usernameInputElement).toHaveValue("123")
    // expect(passwordInputElement).toMatchSnapshot(
    await expect(screen.getByTestId("errorDiv")).toBeInTheDocument()
    // const errorDiv = screen.getByTestId("errorDiv")
    // expect(errorDiv).toMatchSnapshot()
});