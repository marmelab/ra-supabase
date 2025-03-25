import { InferredElement as CoreInferredElement, InferredType } from 'ra-core';

export class InferredElement extends CoreInferredElement {
    constructor(
        type?: InferredType,
        props?: any,
        children?: any,
        private warning?: string
    ) {
        super(type, props, children);
    }

    getWarning() {
        return this.warning;
    }
}
