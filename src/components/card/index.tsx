import { Card, CardContent, Typography } from "@mui/material"



export const CustomCard = ({ title, number, }: { title: string, number: string }) => {

    return (
        <Card>
            <CardContent sx={{textAlign:"center"}}>
                <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h5" component="div" sx={{fontWeight:"bold"}} >
                    {number}
                </Typography>
            </CardContent>
        </Card>
    )
}