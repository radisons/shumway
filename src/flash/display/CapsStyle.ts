/**
 * Copyright 2014 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: CapsStyle
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class CapsStyle extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.CapsStyle");
    }
    
    // JS -> AS Bindings
    static ROUND: string = "round";
    static NONE: string = "none";
    static SQUARE: string = "square";
    
    
    // AS -> JS Bindings

    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return CapsStyle.ROUND;
        case 1:
          return CapsStyle.NONE;
        case 2:
          return CapsStyle.SQUARE;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case CapsStyle.ROUND:
          return 0;
        case CapsStyle.NONE:
          return 1;
        case CapsStyle.SQUARE:
          return 2;
        default:
          return -1;
      }
    }
  }
}
