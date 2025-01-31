'use client'
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow, Paper, IconButton, TableHead, Chip } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { Delete, Edit, LocationOn, Receipt, RemoveRedEye } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { SubTask } from '@/types';

interface TablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
        event: React.MouseEvent<HTMLButtonElement>,
        newPage: number,
    ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

export default function DashboardTable({ rows }: {
    rows:SubTask[]
}) {
    const router = useRouter()
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <TableContainer>
            <Table sx={{ minWidth: 500 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Sr.NO.</TableCell>
                        <TableCell>Task Id</TableCell>
                        <TableCell>Task Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>AssingTo</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Cost</TableCell>
                        <TableCell>VAT%</TableCell> 
                        <TableCell>Total</TableCell> 
                        {/* <TableCell>Work Order</TableCell>  */}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {( rows).map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{index+1}</TableCell>
                            <TableCell>{row.taskId}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.description}</TableCell>
                            <TableCell>{row.subContactor.name}</TableCell>
                            <TableCell>{new Date(row.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(row.endDate).toLocaleDateString()}</TableCell>
                            <TableCell>£ {Number(row.cost).toFixed(2)}</TableCell>
                            <TableCell>{Number(row.vat).toFixed(2)}</TableCell>
                            <TableCell>£ {Number(row.cost + (row.vat/100* row.cost)).toFixed(2)}</TableCell>
                            {/* <TableCell>
                                <IconButton>
                                    <Receipt />
                                </IconButton>
                            </TableCell> */}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
