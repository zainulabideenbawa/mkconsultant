'use client'
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow, Paper, IconButton, TableHead, Chip } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { Delete, Edit, LocationOn, RemoveRedEye } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Material } from '@/types';
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
    rows: Material[]
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
                        <TableCell>Sr. No.</TableCell>
                        <TableCell >Material / Cost</TableCell>
                        <TableCell>Req For</TableCell>
                        <TableCell>Supplier</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Sub Total</TableCell>
                        <TableCell>VAT%</TableCell>
                        <TableCell>Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(rows
                    ).map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{index+1}</TableCell>
                            <TableCell>{row.material}</TableCell>
                            <TableCell>{row.requireFor}</TableCell>
                            <TableCell>{row.supplier.name}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            <TableCell>{row.unit}</TableCell>
                            <TableCell>£ {Number(row.price).toFixed(2)}</TableCell>
                            <TableCell>£ {Number(row.price * row.quantity).toFixed(2)}</TableCell>
                            <TableCell>{Number(row.vat).toFixed(2)}</TableCell>
                            <TableCell>£ {Number(row.totalCost).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
