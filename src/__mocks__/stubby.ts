export class Stubby {
    start = jest.fn().mockImplementation((options, callback) => callback());
}
