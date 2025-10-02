export declare class AssignmentItemDto {
    id?: number;
    route_id: number;
    driver_id: number;
    vehicle_id: number;
    start_date: string;
    end_date: string;
    is_weekly: boolean;
    status?: 'Approved' | 'Pending';
}
