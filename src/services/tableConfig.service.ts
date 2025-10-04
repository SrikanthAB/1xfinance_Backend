import TableConfig, { ITableConfig } from "../models/tableConfig.model";
import ApiError from "../utils/ApiError";

const TableConfigService = {
    async getAllTableConfigs(): Promise<ITableConfig[]> {
        const tableConfigs = await TableConfig.find();
        return tableConfigs;
    },
    async createTableConfig({ tableKey, config }: { tableKey: string, config: Record<string, any> }): Promise<ITableConfig> {
        const tableConfig = await TableConfig.create({
            tableKey,
            config
        });
        if (!tableConfig) {
            throw new ApiError({
                statusCode: 500,
                message: "Failed to create table config"
            });
        }
        return tableConfig;
    },
    async updateTableConfig({ tableKey, config }: { tableKey: string, config: Record<string, any> }): Promise<ITableConfig | null> {
        const tableConfig = await TableConfig.findOneAndUpdate(
            { tableKey },
            { config },
            { new: true }
        );
        if (!tableConfig) {
            throw new ApiError({
                statusCode: 404,
                message: `Table config with key ${tableKey} not found`
            });
        }
        return tableConfig;
    },
    async deleteTableConfigByTableKey(tableKey: string): Promise<ITableConfig | null> {
        const tableConfig = await TableConfig.findOneAndDelete({ tableKey });
        if (!tableConfig) {
            throw new ApiError({
                statusCode: 404,
                message: `Table config with key ${tableKey} not found`
            });
        }
        return tableConfig;
    },
    async deleteTableConfigById(id: string): Promise<ITableConfig | null> {
        const tableConfig = await TableConfig.findByIdAndDelete(id);
        if (!tableConfig) {
            throw new ApiError({
                statusCode: 404,
                message: `Table config with id ${id} not found`
            });
        }
        return tableConfig;
    },
}
export default TableConfigService;