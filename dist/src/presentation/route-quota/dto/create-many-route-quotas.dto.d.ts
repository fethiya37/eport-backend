declare class CreateManyItem {
    route_id: number;
    no_vehicles: number;
}
export declare class CreateManyRouteQuotasDto {
    association_id: number;
    start_date: string;
    end_date: string;
    items: CreateManyItem[];
}
export {};
