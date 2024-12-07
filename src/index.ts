import express from 'express'
import cors from 'cors'
import UserPPRoute from './routers/UserPPRoute'
import ItemRoute from './routers/ItemRoute'
import BorrowRoute from './routers/BorrowRoute'
import analisisRoute from './routers/analisisRoute'

const PORT: number= 8000
const app = express()
app.use(cors())

app.use(express.json())
app.use(`/User`, UserPPRoute)
app.use(`/Item`, ItemRoute)
app.use(`/Borrow`, BorrowRoute)
app.use(`/Analis`, analisisRoute)

app.listen(PORT, () => {
    console.log(`[server]: Server is running at https://localhost:${PORT}`)
})