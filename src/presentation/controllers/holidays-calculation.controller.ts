import { GetAbsencesByUserUseCase } from "@/application/use-cases/absence/get-absences-by-user.use-case";
import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("holidays")
export class HolidayCalculationController {
  constructor(
    private readonly getAbsencesByUserUseCase: GetAbsencesByUserUseCase
  ) {}

  @Get("calculate-holidays/:userId")
  @ApiOperation({
    summary: "Calculate remaining holiday days for an employee (French system)",
  })
  @ApiResponse({
    status: 200,
    description:
      "Holiday days calculated successfully with CP N-1 and CP N breakdown",
    schema: {
      example: {
        cpN1: {
          earnedDays: 25,
          usedDays: 10,
          remainingDays: 15,
          expiryDate: "2025-05-31",
          isExpired: false,
        },
        cpN: {
          earnedDays: 12.5,
          usedDays: 3,
          remainingDays: 9.5,
          currentPeriodEnd: "2025-05-31",
        },
        totalRemainingDays: 24.5,
        canTakeAdvanceDays: true,
        maxAdvanceDays: 12.5,
      },
    },
  })
  async calculateHolidays(
    @Param("userId") userId: string,
    @Query("entryDate") entryDateStr: string,
    @Query("currentDate") currentDateStr?: string
  ): Promise<{
    cpN1: {
      earnedDays: number;
      usedDays: number;
      remainingDays: number;
      expiryDate: string;
      isExpired: boolean;
    };
    cpN: {
      earnedDays: number;
      usedDays: number;
      remainingDays: number;
      currentPeriodEnd: string;
    };
    totalRemainingDays: number;
    canTakeAdvanceDays: boolean;
    maxAdvanceDays: number;
  }> {
    try {
      if (!entryDateStr) {
        throw new HttpException(
          "entryDate query parameter is required (YYYY-MM-DD)",
          HttpStatus.BAD_REQUEST
        );
      }

      const entryDate = new Date(entryDateStr);
      if (isNaN(entryDate.getTime())) {
        throw new HttpException(
          "Invalid entryDate format",
          HttpStatus.BAD_REQUEST
        );
      }

      const currentDate = currentDateStr
        ? new Date(currentDateStr)
        : new Date();
      if (isNaN(currentDate.getTime())) {
        throw new HttpException(
          "Invalid currentDate format",
          HttpStatus.BAD_REQUEST
        );
      }

      // Monthly accrual rate: 25 days / 12 months = 2.0833 days per month
      const MONTHLY_ACCRUAL = 2.0833;

      // Helper function to get reference period dates
      const getReferencePeriodsForDate = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-based

        let currentPeriodStart: Date;
        let currentPeriodEnd: Date;
        let previousPeriodStart: Date;
        let previousPeriodEnd: Date;

        if (month >= 5) {
          // June (5) to December
          // Current period: June current year to May next year
          currentPeriodStart = new Date(year, 5, 1); // June 1st
          currentPeriodEnd = new Date(year + 1, 4, 31); // May 31st next year
          // Previous period: June previous year to May current year
          previousPeriodStart = new Date(year - 1, 5, 1);
          previousPeriodEnd = new Date(year, 4, 31);
        } else {
          // January to May
          // Current period: June previous year to May current year
          currentPeriodStart = new Date(year - 1, 5, 1);
          currentPeriodEnd = new Date(year, 4, 31);
          // Previous period: June year-2 to May year-1
          previousPeriodStart = new Date(year - 2, 5, 1);
          previousPeriodEnd = new Date(year - 1, 4, 31);
        }

        return {
          currentPeriod: { start: currentPeriodStart, end: currentPeriodEnd },
          previousPeriod: {
            start: previousPeriodStart,
            end: previousPeriodEnd,
          },
        };
      };

      const periods = getReferencePeriodsForDate(currentDate);

      // Helper function to calculate earned days for a period
      const calculateEarnedDaysForPeriod = (
        employeeEntryDate: Date,
        periodStart: Date,
        periodEnd: Date,
        calculationDate: Date
      ) => {
        // If employee wasn't hired during this period, no days earned
        if (employeeEntryDate > periodEnd) return 0;

        const workStart = new Date(
          Math.max(employeeEntryDate.getTime(), periodStart.getTime())
        );
        const workEnd = new Date(
          Math.min(calculationDate.getTime(), periodEnd.getTime())
        );

        if (workStart > workEnd) return 0;

        // Calculate months worked in the period
        const monthsWorked = this.calculateMonthsWorked(workStart, workEnd);
        return +(monthsWorked * MONTHLY_ACCRUAL).toFixed(2);
      };

      // Calculate earned days for both periods
      const cpN1EarnedDays = calculateEarnedDaysForPeriod(
        entryDate,
        periods.previousPeriod.start,
        periods.previousPeriod.end,
        periods.previousPeriod.end // Full previous period
      );

      const cpNEarnedDays = calculateEarnedDaysForPeriod(
        entryDate,
        periods.currentPeriod.start,
        periods.currentPeriod.end,
        currentDate // Up to current date
      );

      // Get absences that impact vacation calculation
      const absences = await this.getAbsencesByUserUseCase.execute(userId);

      // Filter absences that impact vacation calculation
      const vacationImpactingAbsences = absences.filter((absence) =>
        this.isVacationImpactingAbsence(absence.typeAbsence)
      );

      // Calculate used days for each period
      const { cpN1UsedDays, cpNUsedDays } = this.calculateUsedDaysByPeriod(
        absences,
        periods,
        entryDate
      );

      // Calculate remaining days
      const cpN1RemainingDays = Math.max(
        0,
        +(cpN1EarnedDays - cpN1UsedDays).toFixed(2)
      );
      const cpNRemainingDays = Math.max(
        0,
        +(cpNEarnedDays - cpNUsedDays).toFixed(2)
      );

      // Check if CP N-1 is expired
      const isExpired = currentDate > periods.previousPeriod.end;

      // Calculate advance vacation possibilities
      const maxPossibleEarnedForCurrentPeriod = 25; // Full year potential
      const maxAdvanceDays = Math.max(
        0,
        maxPossibleEarnedForCurrentPeriod - cpNEarnedDays
      );

      return {
        cpN1: {
          earnedDays: cpN1EarnedDays,
          usedDays: cpN1UsedDays,
          remainingDays: isExpired ? 0 : cpN1RemainingDays, // Expired days become 0
          expiryDate: periods.currentPeriod.end.toISOString().split("T")[0],
          isExpired: isExpired,
        },
        cpN: {
          earnedDays: cpNEarnedDays,
          usedDays: cpNUsedDays,
          remainingDays: cpNRemainingDays,
          currentPeriodEnd: periods.currentPeriod.end
            .toISOString()
            .split("T")[0],
        },
        totalRemainingDays: +(cpN1RemainingDays + cpNRemainingDays).toFixed(2),
        canTakeAdvanceDays: maxAdvanceDays > 0,
        maxAdvanceDays: +maxAdvanceDays.toFixed(2),
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to calculate holidays",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private calculateMonthsWorked(startDate: Date, endDate: Date): number {
    if (startDate > endDate) return 0;

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const startDay = startDate.getDate();

    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const endDay = endDate.getDate();

    // Calculate full months
    let months = (endYear - startYear) * 12 + (endMonth - startMonth);

    // Handle partial months
    if (startDay > 1) {
      // Partial first month
      const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
      const daysWorkedInFirstMonth = daysInStartMonth - startDay + 1;
      const partialFirstMonth = daysWorkedInFirstMonth / daysInStartMonth;

      if (months === 0) {
        // Same month
        const daysWorked = endDay - startDay + 1;
        return daysWorked / daysInStartMonth;
      } else {
        // Subtract the partial first month and add it back correctly
        months = months - 1 + partialFirstMonth;
      }
    }

    // Handle partial last month if not the same month as start
    if (months > 0 && endDay < new Date(endYear, endMonth + 1, 0).getDate()) {
      const daysInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
      const partialLastMonth = endDay / daysInEndMonth;
      months = months - 1 + partialLastMonth;
    }

    return Math.max(0, months);
  }

  private isVacationImpactingAbsence(absenceType: string): boolean {
    const impactingTypes = [
      "absence_injustifiee", // Unjustified absence
      "conge_parental", // Parental leave
      "mise_a_pied", // Suspension
      "conge_sans_solde", // Unpaid leave
    ];
    return impactingTypes.includes(absenceType.toLowerCase());
  }

  private calculateUsedDaysByPeriod(
    absences: any[],
    periods: any,
    entryDate: Date
  ): { cpN1UsedDays: number; cpNUsedDays: number } {
    let cpN1UsedDays = 0;
    let cpNUsedDays = 0;

    const approvedAbsences = absences.filter((a) => a.statut === "approuver");

    for (const absence of approvedAbsences) {
      const dateDebut = absence.dateDebut ? new Date(absence.dateDebut) : null;
      const dateFin = absence.dateFin ? new Date(absence.dateFin) : null;

      if (!dateDebut || !dateFin) continue;

      // Only count absences after entry date
      if (dateFin < entryDate) continue;

      const start = dateDebut < entryDate ? entryDate : dateDebut;
      const joursOuvres = this.countBusinessDays(start, dateFin);

      // Determine which period this absence belongs to
      if (dateFin <= periods.previousPeriod.end) {
        cpN1UsedDays += joursOuvres;
      } else if (dateDebut >= periods.currentPeriod.start) {
        cpNUsedDays += joursOuvres;
      } else {
        // Absence spans both periods - split it
        const splitDate = new Date(
          Math.max(
            periods.currentPeriod.start.getTime(),
            Math.min(periods.previousPeriod.end.getTime(), dateFin.getTime())
          )
        );

        if (start <= periods.previousPeriod.end) {
          const endForPrevious = new Date(
            Math.min(periods.previousPeriod.end.getTime(), dateFin.getTime())
          );
          cpN1UsedDays += this.countBusinessDays(start, endForPrevious);
        }

        if (dateFin >= periods.currentPeriod.start) {
          const startForCurrent = new Date(
            Math.max(periods.currentPeriod.start.getTime(), dateDebut.getTime())
          );
          cpNUsedDays += this.countBusinessDays(startForCurrent, dateFin);
        }
      }
    }

    return {
      cpN1UsedDays: +cpN1UsedDays.toFixed(2),
      cpNUsedDays: +cpNUsedDays.toFixed(2),
    };
  }

  private countBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday (0) or Saturday (6)
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }
}
