import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: "mqtt",
    timestamps: false
})
export default class MqttModel extends Model<MqttModel> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.NUMBER)
    id!: number;

    @Column(DataType.STRING)
    type!: string;

    @Column(DataType.STRING)
    entity!: string;

    @Column(DataType.STRING)
    action!: string;

    @Column(DataType.DATE)
    timestamp!: Date;

    @Column(DataType.JSON)
    message!: object;
}
