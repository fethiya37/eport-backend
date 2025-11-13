import type { UserContext } from 'src/common/context/user-context';
import { ActivityLogService } from '../../application/services/activity-log.service';
import { LogFilterDto } from './dto/log-filter.dto';
import { LogResponseDto } from './dto/log-response.dto';
export declare class ActivityLogController {
    private readonly service;
    constructor(service: ActivityLogService);
    findMany(user: UserContext, query: LogFilterDto): Promise<LogResponseDto[]>;
    findOne(user: UserContext, id: number): Promise<LogResponseDto | null>;
}
