export interface ISum {
    name: string;
    age: number;
}
export const sum = (obj: ISum) => {
    return obj.name + obj.age;
}