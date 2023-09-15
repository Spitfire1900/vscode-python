/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IDisposable {
    dispose(): void;
}

/**
 * Adds a handler that handles one event on the emitter, then disposes itself.
 */
export const once = <T>(event: Event<T>, listener: (data: T) => void): IDisposable => {
    const disposable = event((value) => {
        listener(value);
        disposable.dispose();
    });

    return disposable;
};

export interface Event<T> {
    (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
}

/**
 * Base event emitter. Calls listeners when data is emitted.
 */
export class EventEmitter<T> {
    private listeners?: Array<(data: T) => void> | ((data: T) => void);

    /**
     * Event<T> function.
     */
    public readonly event: Event<T> = (listener, thisArgs, disposables) => {
        const d = this.add(thisArgs ? listener.bind(thisArgs) : listener);
        disposables?.push(d);
        return d;
    };

    /**
     * Gets the number of event listeners.
     */
    public get size(): number {
        if (!this.listeners) {
            return 0;
        }
        if (typeof this.listeners === 'function') {
            return 1;
        }
        return this.listeners.length;
    }

    /**
     * Emits event data.
     */
    public fire(value: T): void {
        if (!this.listeners) {
            // no-op
        } else if (typeof this.listeners === 'function') {
            this.listeners(value);
        } else {
            for (const listener of this.listeners) {
                listener(value);
            }
        }
    }

    /**
     * Disposes of the emitter.
     */
    public dispose(): void {
        this.listeners = undefined;
    }

    private add(listener: (data: T) => void): IDisposable {
        if (!this.listeners) {
            this.listeners = listener;
        } else if (typeof this.listeners === 'function') {
            this.listeners = [this.listeners, listener];
        } else {
            this.listeners.push(listener);
        }

        return { dispose: () => this.rm(listener) };
    }

    private rm(listener: (data: T) => void) {
        if (!this.listeners) {
            return;
        }

        if (typeof this.listeners === 'function') {
            if (this.listeners === listener) {
                this.listeners = undefined;
            }
            return;
        }

        const index = this.listeners.indexOf(listener);
        if (index === -1) {
            return;
        }

        if (this.listeners.length === 2) {
            this.listeners = index === 0 ? this.listeners[1] : this.listeners[0];
        } else {
            this.listeners = this.listeners.slice(0, index).concat(this.listeners.slice(index + 1));
        }
    }
}
