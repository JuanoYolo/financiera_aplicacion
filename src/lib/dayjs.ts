// src/lib/dayjs.ts
import dayjs from 'dayjs'
import 'dayjs/locale/es'

// Plugins que usamos en store/reportes
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isBetween from 'dayjs/plugin/isBetween' // opcional, pero útil

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(isBetween)

dayjs.locale('es')

export default dayjs
