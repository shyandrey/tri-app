import Foundation
import ImageIO
import CoreGraphics
import CryptoKit

func inspect(_ path: String) throws -> [String: Any] {
    guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
          CGImageSourceGetCount(source) == 1,
          CGImageSourceGetStatus(source) == .statusComplete,
          let props = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
          let w = props[kCGImagePropertyPixelWidth] as? Int,
          let h = props[kCGImagePropertyPixelHeight] as? Int,
          w > 0, h > 0, w <= 10000, h <= 10000, w * h <= 25000000,
          let image = CGImageSourceCreateImageAtIndex(source, 0, [kCGImageSourceShouldCacheImmediately: true] as CFDictionary),
          CGImageSourceGetStatusAtIndex(source, 0) == .statusComplete else {
        throw NSError(domain: "decode", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid, incomplete, animated or oversized image"])
    }
    let space = CGColorSpaceCreateDeviceRGB()
    let flags = CGImageAlphaInfo.premultipliedLast.rawValue
    guard let full = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: space, bitmapInfo: flags),
          let thumb = CGContext(data: nil, width: 9, height: 8, bitsPerComponent: 8, bytesPerRow: 36, space: space, bitmapInfo: flags) else {
        throw NSError(domain: "decode", code: 2)
    }
    full.draw(image, in: CGRect(x: 0, y: 0, width: w, height: h))
    let pixels = Data(bytes: full.data!, count: w * h * 4)
    thumb.setFillColor(CGColor(gray: 1, alpha: 1)); thumb.fill(CGRect(x: 0, y: 0, width: 9, height: 8))
    thumb.interpolationQuality = .high
    thumb.draw(image, in: CGRect(x: 0, y: 0, width: 9, height: 8))
    let t = thumb.data!.assumingMemoryBound(to: UInt8.self)
    func gray(_ n: Int) -> Int { Int(t[n*4])*299 + Int(t[n*4+1])*587 + Int(t[n*4+2])*114 }
    var hash: UInt64 = 0
    for y in 0..<8 { for x in 0..<8 { hash = (hash << 1) | (gray(y*9+x) > gray(y*9+x+1) ? 1 : 0) } }
    return ["path": path, "width": w, "height": h, "decoded": true,
            "pixelSha256": SHA256.hash(data: pixels).map { String(format: "%02x", $0) }.joined(),
            "dHash": String(format: "%016llx", hash)]
}
var output: [[String: Any]] = []
for path in CommandLine.arguments.dropFirst() {
    do { output.append(try inspect(path)) }
    catch { output.append(["path": path, "error": error.localizedDescription]) }
}
let data = try JSONSerialization.data(withJSONObject: output, options: [.sortedKeys])
print(String(data: data, encoding: .utf8)!)
