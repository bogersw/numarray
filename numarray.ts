interface Linear {
    dot(arr: NumArray): number;
}

interface Mathematical {
    add(value: number | NumArray): NumArray;
    ceil(): NumArray;
    cos(radians: boolean): NumArray;
    cumprod(): NumArray;
    cumsum(): NumArray;
    divide(arr: NumArray): NumArray;
    exp(): NumArray;
    exp10(): NumArray;
    floor(): NumArray;
    log(): NumArray;
    log10(): NumArray;
    max(): number;
    maximum(arr: NumArray): NumArray;
    min(): number;
    minimum(arr: NumArray): NumArray;
    multiply(value: number | NumArray): NumArray;
    round(decimals: number): NumArray;
    sin(radians: boolean): NumArray;
    subtract(arr: NumArray): NumArray;
    sum(): number;
    tan(radians: boolean): NumArray;
}

interface Random {
    choice(): number;
    sample(size: number, replace: boolean): number[];
    shuffle(): NumArray;
}

interface Statistical {
    average(weights: number[]): number;
    iqr(): number;
    mean(): number;
    median(): number;
    percentile(p: number): number;
    quantile(q: number): number[];
    std(population: boolean): number;
    variance(population: boolean): number;
}

export class NumArray implements Linear, Mathematical, Random, Statistical {
    private readonly data: number[];

    /**
     * Creates a new numeric array instance from the given data. A NumArray is basically
     * a regular array with some additional methods which regularly come up and which are
     * conveniently collected in this class. Inspired by Python's NumPy.
     *
     * @param data  The data to initialize the array with. Can be a collection of numbers
     *              or an iterable object (array, set, ...). Can also be left empty, in which
     *              case an empty array is created.
     */
    constructor(...numbers: number[] | [Iterable<number>]) {
        // Input: separate elements or array / set / ...?
        let values: number[] = [];
        if (numbers.length === 1 && Symbol.iterator in Object(numbers) && typeof numbers[0] === "object") {
            // An iterable object has been passed (array, set, ...): [[..., ..., ...]]
            // Note that the typeof check is added to prevent single number entries from ending
            // up in this branch.
            // @ts-ignore: TypeScript complains about "no overload matches this call"
            values = Array.from(numbers[0]);
        } else {
            // Separate numbers / elements have been passed [..., ..., ...]
            // @ts-ignore: TypeScript complains about "no overload matches this call"
            values = Array.from(numbers);
        }
        // Make sure that only numbers are passed in and that there are no NaNs.
        if (!values.every((value) => typeof value === "number" && !Number.isNaN(value))) {
            throw new Error("Input contains non-numeric values: only numbers are allowed.");
        }
        this.data = values;
    }

    /**
     * STATIC METHOD. Constructs a new numeric array where the elements are separated
     * by the specified step value (linear spacing). The start value is always included
     * in the generated range of values, the stop value can be included or excluded
     * depending on the step value.
     *
     * @param start     The start value of the generated range of values in the array (inclusive).
     * @param stop      The stop value of the generated range of values in the array (inclusive / exclusive).
     * @param step      The step value of the generated range of values in the array.
     * @returns         A new NumArray with values separated by the specified step value.
     */
    static arange(start: number, stop: number, step: number = 1): NumArray {
        if (step === 0) throw new Error("The step value can not be 0.");
        if (start === stop) return new NumArray();
        if (start < stop && step < 0) return new NumArray();
        if (start > stop && step > 0) return new NumArray();
        return new NumArray(Array.from({ length: 1 + (stop - start) / step }, (_, index) => start + index * step));
    }

    /**
     * STATIC METHOD. Constructs a new numeric array with all elements set to the
     * specified value.
     *
     * @param length    The number of elements in the resulting NumArray (>=0, integer value).
     * @param fillValue The value to fill the NumArray with.
     * @returns         A new NumArray with all elements set to 'fillValue'.
     */
    static fill(length: number, fillValue: number): NumArray {
        if (length < 0 || length % 1 !== 0) throw new Error("Length must be a positive integer.");
        return new NumArray(Array.from({ length: length }, () => fillValue));
    }

    /**
     * STATIC METHOD. Constructs a new numeric array from the specified string. The string
     * will be parsed to generate a list of numbers, given the specified separator (default ;).
     * If the string contains any non-numeric values, an error will be thrown. NaN values are also
     * considered to be non-numeric values. An empty string will result in an empty NumArray.
     *
     * @param numbers   The string with numeric values, separated by the specified separator.
     * @param separator The separator used to separate / identify the values in the string (default ;).
     * @returns         A new NumArray.
     */
    static fromString(numbers: string, separator: string = ";"): NumArray {
        if (numbers.trim() === "") return new NumArray();
        const values: number[] = numbers.split(separator).map((value) => Number(value));
        return new NumArray(values);
    }

    /**
     * STATIC METHOD. Constructs a new numeric array with the specified number of
     * elements, linearly spaced between the start and stop values. If the specified
     * number of elements is 1 and / or the start and stop values are equal, then
     * the start value will be returned. The generated range of values is including
     * the start and stop values.
     *
     * @param start     The start value of the generated range of values in the array.
     * @param stop      The stop value of the generated range of values in the array.
     * @param length    The number of elements in the resulting NumArray.
     * @returns         A new NumArray with linearly spaced values between start (inclusive) and stop (inclusive).
     */
    static linspace(start: number, stop: number, length: number): NumArray {
        if (length < 0 || length % 1 !== 0) throw new Error("Length must be a positive integer.");
        if (length === 1 || start === stop) return new NumArray(start);
        return new NumArray(
            Array.from({ length: length }, (_, index) => start + ((stop - start) * index) / (length - 1))
        );
    }

    /**
     * STATIC METHOD. Constructs a new numeric array with all elements set to 1.
     *
     * @param length    The number of elements in the resulting NumArray (>=0, integer value).
     * @returns         A new NumArray with all elements set to 1.
     */
    static ones(length: number): NumArray {
        return this.fill(length, 1);
    }

    /**
     * STATIC METHOD. Constructs a new numeric array with all elements set to a random
     * value (float). The random values are sampled from a uniform distribution between
     * 0 and 1.
     *
     * @param length    The number of elements in the resulting NumArray (>=0, integer value).
     * @returns         A new NumArray with all elements set to a random value.
     */
    static random(length: number): NumArray {
        if (length < 0 || length % 1 !== 0) throw new Error("Length must be a positive integer.");
        return new NumArray(Array.from({ length: length }, () => Math.random()));
    }

    /**
     * STATIC METHOD. Constructs a new numeric array with all elements set to a random
     * integer value between a minimum value (inclusive) and a maximum value (inclusive).
     * The random values are sampled from a uniform distribution.
     *
     * @param min       The minimum value for the random integers (integer value).
     * @param max       The maximum value for the random integers (integer value).
     * @param length    The number of elements in the resulting NumArray (>=0, integer value).
     * @returns         A new NumArray with all elements set to a random integer value.
     */
    static randomInt(min: number, max: number, length: number): NumArray {
        if (length < 0 || length % 1 !== 0) throw new Error("Length must be a positive integer.");
        if (min % 1 !== 0 || max % 1 !== 0) throw new Error("Minimum and maximum values must be integers.");
        if (min >= max) throw new Error("Minimum value must be smaller than maximum value.");
        return new NumArray(Array.from({ length: length }, () => Math.floor(Math.random() * (max - min + 1)) + min));
    }

    /**
     * STATIC METHOD. Constructs a new numeric array with all elements set to a random
     * value (float) between a minimum value (inclusive) and a maximum value (exclusive).
     * The random values are sampled from a uniform distribution.
     *
     * @param min       The minimum value for the random values..
     * @param max       The maximum value for the random values.
     * @param length    The number of elements in the resulting NumArray (>=0, integer value).
     * @returns         A new NumArray with all elements set to a random value (float).
     */
    static randomFloat(min: number, max: number, length: number): NumArray {
        if (length < 0 || length % 1 !== 0) throw new Error("Length must be a positive integer.");
        if (min >= max) throw new Error("Minimum value must be smaller than maximum value.");
        return new NumArray(Array.from({ length: length }, () => Math.random() * (max - min) + min));
    }

    /**
     * STATIC METHOD. Constructs a new numeric array with all elements set to 0.
     *
     * @param length    The number of elements in the resulting NumArray (>=0, integer value).
     * @returns         A new NumArray with all elements set to 0.
     */
    static zeros(length: number): NumArray {
        return this.fill(length, 0);
    }

    // ========================================================================
    // Linear algebra
    // ========================================================================

    /**
     * Computes the dot product of the current array and the given array.
     *
     * @param arr   The numeric array to compute the dot product with.
     * @returns     The dot product of this vector and the given vector.
     */
    dot(arr: NumArray): number {
        if (this.data.length != arr.length) {
            throw new Error("Array lengths must be equal to calculate the dot product.");
        }
        return this.data.reduce((acc, current, index) => acc + current * arr.element(index), 0);
    }

    // ========================================================================
    // Mathematical functions
    // ========================================================================

    /**
     * Adds the given array to this array (element-wise addition).
     *
     * @param arr The array to add to this array (element-wise).
     * @returns   A new array that is the sum of array vector and the given array.
     */
    add(value: number | NumArray): NumArray {
        // Scalar addition: value is a number
        if (typeof value === "number") {
            return new NumArray(this.data.map((el) => el + value));
        }
        // Array addition: value is an array
        if (this.data.length != value.length) {
            throw new Error("Array lengths must be equal for addtion.");
        }
        return new NumArray(this.data.map((el, index) => el + value.element(index)));
    }

    ceil(): NumArray {
        // Transform entries to the ceil of their value
        return new NumArray(this.data.map((el) => Math.ceil(el)));
    }

    cos(radians: boolean): NumArray {
        // Transform entries to the cosine of their value
        if (radians) return new NumArray(this.data.map((el) => Math.cos(el)));
        return new NumArray(this.data.map((el) => Math.cos((Math.PI / 180) * el)));
    }

    cumprod(): NumArray {
        // Transform vector into a cumulative product vector
        let prod = 1;
        return new NumArray(this.data.map((num) => (prod *= num)));
    }

    cumsum(): NumArray {
        // Transform vector into a cumulative sum vector
        let sum = 0;
        return new NumArray(this.data.map((num) => (sum += num)));
    }

    divide(value: number | NumArray): NumArray {
        // Scalar division: value is a number
        if (typeof value === "number") {
            return new NumArray(this.data.map((el) => el / value));
        }
        // Array division: value is an array
        if (this.data.length != value.length) {
            throw new Error("Array lengths must be equal for division.");
        }
        if (value.elements.some((el) => el === 0)) {
            throw new Error("Cannot divide by zero.");
        }
        return new NumArray(this.data.map((el, index) => el / value.element(index)));
    }

    exp(): NumArray {
        // Transform entries to the exponential of their value
        return new NumArray(this.data.map((el) => Math.exp(el)));
    }

    exp10(): NumArray {
        // Transform entries to the base-10 exponential of their value
        return new NumArray(this.data.map((el) => Math.pow(10, el)));
    }

    floor(): NumArray {
        // Transform entries to the floor of their value
        return new NumArray(this.data.map((el) => Math.floor(el)));
    }

    log(): NumArray {
        // Transform entries to the natural logarithm of their value
        return new NumArray(this.data.map((el) => Math.log(el)));
    }

    log10(): NumArray {
        // Transform entries to the base-10 logarithm of their value
        return new NumArray(this.data.map((el) => Math.log10(el)));
    }

    max(): number {
        // Maximum value
        return this.data.reduce((acc, current) => (current > acc ? current : acc));
    }

    maximum(arr: NumArray): NumArray {
        // Maximum value
        if (this.data.length != arr.length) {
            throw new Error("Array lengths must be equal for calculating the maximum.");
        }
        return new NumArray(this.data.map((el, index) => (el > arr.element(index) ? el : arr.element(index))));
    }

    min(): number {
        // Minimum value
        return this.data.reduce((acc, current) => (current < acc ? current : acc));
    }

    minimum(arr: NumArray): NumArray {
        // Minimum value
        if (this.data.length != arr.length) {
            throw new Error("Array lengths must be equal for calculating the minimum.");
        }
        return new NumArray(this.data.map((el, index) => (el < arr.element(index) ? el : arr.element(index))));
    }

    multiply(value: number | NumArray): NumArray {
        // Scalar multiplication: value is a number
        if (typeof value === "number") {
            return new NumArray(this.data.map((el) => el * value));
        }
        // Array multiplication: value is an array
        if (this.data.length != value.length) {
            throw new Error("Array lengths must be equal for multiplication.");
        }
        return new NumArray(this.data.map((el, index) => el * value.element(index)));
    }

    round(decimals: number): NumArray {
        // Round entries to the specified number of decimals
        return new NumArray(this.data.map((el) => Number(el.toFixed(decimals))));
    }

    sin(radians: boolean = true): NumArray {
        // Transform entries to the sine of their value
        if (radians) return new NumArray(this.data.map((el) => Math.sin(el)));
        return new NumArray(this.data.map((el) => Math.sin((Math.PI / 180) * el)));
    }

    subtract(value: number | NumArray): NumArray {
        // Scalar subtraction: value is a number
        if (typeof value === "number") {
            return new NumArray(this.data.map((el) => el - value));
        }
        // Array subtraction: value is an array
        if (this.data.length != value.length) {
            throw new Error("Array lengths must be equal for subtraction.");
        }
        return new NumArray(this.data.map((el, index) => el - value.element(index)));
    }

    sum(): number {
        // Sum of entries
        return this.data.reduce((acc, current) => acc + current, 0);
    }

    tan(radians: boolean = true): NumArray {
        // Transform entries to the tangent of their value
        if (radians) return new NumArray(this.data.map((el) => Math.tan(el)));
        return new NumArray(this.data.map((el) => Math.tan((Math.PI / 180) * el)));
    }

    // ========================================================================
    // Random functions
    // ========================================================================

    choice(): number {
        // Return a random choice from the vectors entries
        const index = Math.floor(Math.random() * this.data.length);
        return this.data[index];
    }

    /**
     * Returns a sample of `size` values. Sampling can be done with replacement
     * or without replacement.
     *
     * @param size - The number of values to sample.
     * @param replace - Sample with / without replacement. Dafault: with replacement.
     * @returns An array containing the sampled values.
     *
     */
    sample(size: number, replace: boolean = true): number[] {
        const result: number[] = [];
        if (replace) {
            // Sample with replacement
            for (let i = 1; i <= size; i++) {
                result.push(this.choice());
            }
        } else {
            // Sample without replacement
            if (size > this.data.length) {
                throw new Error("Sample size can not exceed array length.");
            }
            const sampleData: number[] = [...this.data];
            let numSamples = 0;
            for (let i = 1; i <= size; i++) {
                const index = Math.floor(Math.random() * (size - numSamples));
                result.push(sampleData[index]);
                sampleData.splice(index, 1);
                numSamples += 1;
            }
        }
        return result;
    }

    shuffle(): NumArray {
        const shuffleData: number[] = [...this.data];
        for (let i = 0; i < this.data.length; i++) {
            const swapIndex = NumArray.randomInt(1, 0, this.data.length - 1).element(0);
            [shuffleData[i], shuffleData[swapIndex]] = [shuffleData[swapIndex], shuffleData[i]];
        }
        return new NumArray(shuffleData);
    }

    // ========================================================================
    // Statistical functions
    // ========================================================================

    average(weights: number[]): number {
        if (weights.length != this.data.length) {
            throw new Error("Number of weights must be equal to the array length to calculate the weighted average.");
        }
        const sumOfWeights = weights.reduce((acc, current) => acc + current, 0);
        const weightedVector = this.data.map((el, index) => (el * weights[index]) / sumOfWeights);
        return weightedVector.reduce((acc, current) => acc + current, 0);
    }

    iqr(): number {
        // Interquartile range
        return this.percentile(75) - this.percentile(25);
    }

    mean(): number {
        // Arithmetic mean
        return this.sum() / this.data.length;
    }

    median(): number {
        // Median value
        return this.percentile(50);
    }

    percentile(p: number): number {
        // Percentile (linear method)
        if (p < 0 || p > 100) {
            throw new Error("Percentile should be between 0 and 100 (inclusive).");
        }
        // Sort data and determine index of percentile value
        const sorted = [...this.data].sort((a, b) => a - b);
        const index = (sorted.length - 1) * (p / 100);
        const indexFloor = Math.floor(index);
        const indexCeil = Math.ceil(index);
        // Percentile: unique index => value, two indices => calculated value
        if (indexFloor === indexCeil) return sorted[indexFloor];
        return sorted[indexFloor] * (indexCeil - index) + sorted[indexCeil] * (index - indexFloor);
    }

    quantile(q: number): number[] {
        // Examples:
        // 2-quantile  = median.
        // 3-quantiles = tertiles
        // 4-quantiles = quartiles
        // ...
        const result: number[] = [];
        for (let i = 0; i < q - 1; i++) {
            result.push(this.percentile((100 / q) * (i + 1)));
        }
        return result;
    }

    std(population: boolean = true): number {
        // Standard deviation
        return Math.sqrt(this.variance(population));
    }

    variance(population: boolean = true): number {
        // Variance, population / sample.
        return (
            this.data.map((el) => Math.pow(Math.abs(el - this.mean()), 2)).reduce((acc, current) => acc + current, 0) /
            (population ? this.data.length : this.data.length - 1)
        );
    }

    // ========================================================================
    // Miscellaneous functions
    // ========================================================================

    get elements(): number[] {
        // Return copy of the data as an array
        return [...this.data];
    }

    element(index: number): number {
        if (index < 0 || index >= this.data.length) {
            throw new Error("Index out of bounds.");
        }
        return this.data[index];
    }

    get length(): number {
        // Length of vector
        return this.data.length;
    }
}
