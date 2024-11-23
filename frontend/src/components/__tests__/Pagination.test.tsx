import { render, fireEvent, screen } from "@testing-library/react";
import Pagination from "../Pagination";

describe("Pagination", () => {
    it("renders correct page numbers", () => {
        render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />);

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("changes page when Next is clicked", () => {
        const mockOnPageChange = jest.fn();
        render(<Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />);

        fireEvent.click(screen.getByText("Next"));
        expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it("changes page when Previous is clicked", () => {
        const mockOnPageChange = jest.fn();
        render(<Pagination currentPage={2} totalPages={3} onPageChange={mockOnPageChange} />);

        fireEvent.click(screen.getByText("Previous"));
        expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it("changes page when a page number is clicked", () => {
        const mockOnPageChange = jest.fn();
        render(<Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />);

        fireEvent.click(screen.getByText("2"));
        expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
});
