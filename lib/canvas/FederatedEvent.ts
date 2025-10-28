// lib/canvas/FederatedEvent.ts
export interface IPointData {
    x: number;
    y: number;
}

export class FederatedPointerEvent {
    // DOM Event properties
    type: string = '';
    bubbles: boolean = true;
    cancelable: boolean = true;
    composed: boolean = false;

    // Event state
    defaultPrevented: boolean = false;
    propagationStopped: boolean = false;
    propagationImmediatelyStopped: boolean = false;

    // Target information
    target: any = null;
    currentTarget: any = null;

    // Pointer information
    pointerId: number = 1;
    pointerType: string = 'mouse';
    isPrimary: boolean = true;
    button: number = 0;
    buttons: number = 0;

    // Position in different coordinate systems
    client: IPointData = { x: 0, y: 0 };  // Viewport coordinates
    screen: IPointData = { x: 0, y: 0 };   // Canvas/world coordinates

    // Native event
    nativeEvent: MouseEvent | PointerEvent | TouchEvent | null = null;

    // Event phase constants
    readonly NONE = 0;
    readonly CAPTURING_PHASE = 1;
    readonly AT_TARGET = 2;
    readonly BUBBLING_PHASE = 3;

    // Current event phase
    eventPhase: number = 0;

    // Modifiers
    ctrlKey: boolean = false;
    shiftKey: boolean = false;
    altKey: boolean = false;
    metaKey: boolean = false;

    // Additional pointer properties
    clientX: number = 0;
    clientY: number = 0;
    screenX: number = 0;
    screenY: number = 0;
    pageX: number = 0;
    pageY: number = 0;
    offsetX: number = 0;
    offsetY: number = 0;
    movementX: number = 0;
    movementY: number = 0;

    // Path for event propagation
    path: any[] = [];

    preventDefault(): void {
        if (this.nativeEvent instanceof Event && this.nativeEvent.cancelable) {
            this.nativeEvent.preventDefault();
        }
        this.defaultPrevented = true;
    }

    stopPropagation(): void {
        this.propagationStopped = true;
    }

    stopImmediatePropagation(): void {
        this.propagationImmediatelyStopped = true;
        this.propagationStopped = true;
    }

    composedPath(): any[] {
        return this.path;
    }

    // Copy data from native event
    copyFromNative(nativeEvent: PointerEvent | MouseEvent | TouchEvent): void {
        this.nativeEvent = nativeEvent;

        if ('pointerId' in nativeEvent) {
            this.pointerId = nativeEvent.pointerId;
            this.pointerType = nativeEvent.pointerType;
            this.isPrimary = nativeEvent.isPrimary;
        }

        if ('button' in nativeEvent) {
            this.button = nativeEvent.button;
            this.buttons = nativeEvent.buttons;
        }

        if ('clientX' in nativeEvent) {
            this.clientX = nativeEvent.clientX;
            this.clientY = nativeEvent.clientY;
            this.screenX = nativeEvent.screenX;
            this.screenY = nativeEvent.screenY;
            this.pageX = nativeEvent.pageX;
            this.pageY = nativeEvent.pageY;
        }

        this.ctrlKey = nativeEvent.ctrlKey;
        this.shiftKey = nativeEvent.shiftKey;
        this.altKey = nativeEvent.altKey;
        this.metaKey = nativeEvent.metaKey;
    }
}

// Drag event that extends pointer event
export class FederatedDragEvent extends FederatedPointerEvent {
    // Drag-specific properties
    dragTarget: any = null;
    dragStartX: number = 0;
    dragStartY: number = 0;
    dragOffsetX: number = 0;
    dragOffsetY: number = 0;
}